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

1. The following lets you navigate to the list of applicants in the reader/queue and it will scrape and download their applications.

```bash
    node main.js YOURUNI YOURPASSWORD

    # Special characters like $ should be escaped.  e.g., AB\$CD

    # After the script logs in to Columbia, it will first wait for you
    # to accept Duo on your phone.

    # Then, after it logs in to Slate, it will wait for you to filter
    # the list of applicants in the "search" tab.  Once you are happy 
    # press ENTER to download PDFs for all applicants on the page.
```
    
2. The other option is to pass in a list of applicant names and IDs and slaterobot will download their pdfs.
  * [create a query](https://apply.engineering.columbia.edu/manage/query/) that matches your conditions.  
  * Make sure the query exports the applicant's `Name` and `ID`.   
  * Press "Export" to download the query results as an excel file 
  * Store it as a CSV.   **Excel will append a control character at the beginning of the file that screws up our parsing, so open a text editor to remove any control characters**
  * run:

```bash
    node main.js YOUR UNI YOURPASSWORD applicants.csv

    # After accepting Duo on your phone, you don't need to do anything.
```
