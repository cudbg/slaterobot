# Slate Robot

Slate is hard to use.  This will log in, and auto-download applicant PDFs for you.

Install

    npm install .

Run

    node main.js YOURUNI YOURPASSWORD

    # After the script logs in to Columbia, it will first wait for you
    # to accept Duo on your phone.


    # Then, after it logs in to Slate, it will wait for you to filter
    # the list of applicants in the search tab.  Once you are happy 
    # press ENTER to download PDFs for all applicants on the page.
    