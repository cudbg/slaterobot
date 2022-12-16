# Slate Robot

Slate is hard to use.  This will log in, and auto-download applicant PDFs for you.

## Install

* [Install node](https://nodejs.org/en/download/)
* clone git repo and install package

```bash
    git clone git@github.com:sirrice/slaterobot.git
    cd ./slaterobot/
    npm install .
```    

## Usage

There are two ways to run slaterobot.   In both cases, it will download pdfs into `./downloads/`

```bash
  > node main.js --help

  node main.js YOURUNI YOURPASSWORD [slate CSV file]

  Use Chromium headless browser to scrape Slate and download applicant
  PDFs into ./downloads/

  slate CSV file: path to exported CSV file from slate's SQL search query.
                  make sure Name and ID are exported fields in the query.

                  if CSV file is not specified, program will navigate
                  to Slate Reader's search page and wait for you to filter
                  for your desired applicants before scraping.
```

A few notes on usage

* Special characters like $ should be escaped.  e.g., AB\$CD
* the script uses your credentials to log in to Columbia, it will wait for you to accept Duo on your phone.
* If you gave a CSV file, it will just scrape those.  Make sure they contain a `Name` and `ID` field!
* Otherwise,program will navigate to Slate Reader's search page and wait for you to filter for your desired applicants.
  Then press ENTER in the command line to download PDFs for all applicants on the page.

Creating the CSV file

* [Create a query on slate](https://apply.engineering.columbia.edu/manage/query/) that matches your conditions.  
* Make sure the query exports the applicant's `Name` and `ID`.   
* Press "Export" to download the query results as an excel file 
k Store it as a CSV.   **Excel will append a control character at the beginning of the file that screws up our parsing, so open a text editor to remove any control characters**
