const fs = require("fs");
const fse = require('fs-extra'); // v 5.0.0
const playwright = require('playwright');
const readline = require('readline');

functionToExpose = async (strbuf, targetFile) => {
  const str2ab = function _str2ab(str) { // Convert a UTF-8 String to an ArrayBuffer
	let buf = new ArrayBuffer(str.length); // 1 byte for each char
	let bufView = new Uint8Array(buf);

	for (let i=0, strLen=str.length; i < strLen; i++) {
	  bufView[i] = str.charCodeAt(i);
	}
	return buf;
  }

  return new Promise((resolve, reject) => {
	// Convert the ArrayBuffer string back to an ArrayBufffer, which in turn is converted to a Buffer
	let buf = Buffer.from(str2ab(strbuf));
	
	// Try saving the file.        
	fs.writeFile(targetFile, buf, (err, text) => {
	  if(err) reject(err);
	  else resolve(targetFile);
	});
  });
};

pdfDownloader = async ([url, outpath]) => { 

  function arrayBufferToString(buffer){ // Convert an ArrayBuffer to an UTF-8 String
    let bufView = new Uint8Array(buffer);
    let length = bufView.length;
    let result = '';
    let addition = Math.pow(2,8)-1;

    for(let i = 0;i<length;i+=addition){
      if(i + addition > length){
          addition = length - i;
      }
      result += String.fromCharCode.apply(null, bufView.subarray(i,i+addition));
    }
    return result;
  }
  
  try {
    let response = await fetch(url, {
       credentials: 'same-origin', // usefull when we are logged into a website and want to send cookies
       responseType: 'arraybuffer', // get response as an ArrayBuffer
    })
    arrayBuffer = await response.arrayBuffer()
    let bufstring = arrayBufferToString(arrayBuffer);
    return window.writeABString(bufstring, outpath);
  } catch (e) { 
     console.log('Request failed: ', e);
  } 

}

async function scrapeSlate(_, [uni, password]) {

  const browserType = "chromium";
  const browser = await playwright[browserType].launch({ 
    headless: false ,
    downloadsPath: "./downloads",
  });
  const context = await browser.newContext({
    acceptDownloads: true
  });

  const page = await context.newPage();
  page.on('dialog', async dialog => {
    await dialog.accept();
  });



  await page.goto('https://apply.engineering.columbia.edu/manage')
  await page.waitForSelector("#password")
  await page.fill("#username", uni); 
  await page.fill("#password", password);
  console.log("click login")
  await page.click("text='LOGIN'");

  console.log("Waiting 5 seconds for Duo to load")
  await (new Promise(res => setTimeout(res, 1000)))


  let duo_frame = page.mainFrame().childFrames()[0]; 
  await duo_frame.waitForLoadState("domcontentloaded")
  await duo_frame.waitForLoadState("networkidle")
  let el = await duo_frame.$("#auth_methods button");
  await el.click()

  await page.waitForSelector("#menu__manage_reader_");
  console.log("navigating to search page")

  await page.goto("https://apply.engineering.columbia.edu/manage/reader/?tab=browse")
  await (new Promise(res => setTimeout(res, 1500)))
  await askQuestion("Filter and navigate to search results page.  Press ENTER to start downloading.")

  let user_ids = [];
  let names = [];
  let trs = await page.$$(".reader_dashboard_content tbody tr[data-id]")
  console.log("Got " + trs.length + " rows from search");
  for (let i = 0; i < Math.min(trs.length, 10); i++) {
    user_ids.push(await trs[i].getAttribute("data-id"));
    names.push(await trs[i].$eval("xpath=./td[position()=5]", (e) => e.innerText))
  }
  console.log("Got " + user_ids.length + " users")
  console.log(user_ids.slice(0,2))
  console.log(names.slice(0,2))

  async function download_user_id(id, path) {
    let url = `https://apply.engineering.columbia.edu/manage/reader/?id=${id}`;
    let user_page = await context.newPage();
    user_page.on('dialog', async dialog => { await dialog.accept(); });

    await user_page.goto(url);

    await user_page.click(".reader_header_title");
    let pdf_url_suffix = await user_page.getAttribute("text='Download PDF'", "href");
    let pdf_url = `https://apply.engineering.columbia.edu/manage/reader/${pdf_url_suffix}`;
    user_page.exposeFunction("writeABString", functionToExpose);
    let ret = await user_page.evaluate(pdfDownloader, [pdf_url, path])
    console.log(ret)
    await user_page.close()
  }

  let i = 0;
  let block = 10;
  for (let outer = 0; outer < user_ids.length; outer += block) {
    let promises = [];
    for (let i = 0; i < Math.min(block, user_ids.length-outer); i++) {
      let [id, name] = [user_ids[outer+i], names[outer+i]];
      let applicant_name = name.replace(/[,()]+/g, " ").replace(/\s+/g, "_");
      let path =`./downloads/${applicant_name}.pdf`;
      console.log("downloading app # ", i, id, path);
      promises.push(download_user_id(id, path))
    }
    await Promise.all(promises)
  }

  await page.goto("https://apply.engineering.columbia.edu/manage/logout?")
  await browser.close();
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }))
}

(async () => {
  if (process.length < 4) {
    console.log("node main.js YOURUNI YOURPASSWORD")
    return;
  }

  let uni, password = [process.argv[2], process.argv[3]];
  console.log(uni, password)
  scrapeSlate(uni, password);
})();
