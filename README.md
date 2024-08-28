# match_customEvents_appNames
Sample code to query your custom events and match them to the Application Names instrumenting these events.

This code was built using node.js,

You must execute all the project files in the same directory (you can create it wherever you want),

The 'accounts_keys.csv' file hosts the account numbers and account API keys of all the accounts for which you want to collect data,

What do you need? Access to a New Relic account with the "integration management" permission, and node.js v20.9.0 npm (local), with: 
├── axios@1.7.5
├── csv-parser@3.0.0
├── csv-writer@1.6.0
├── esm@3.2.25
├── fs@0.0.1-security
├── got@14.0.0
├── graphql-request@6.1.0
├── json2csv@6.0.0-alpha.2
├── node-fetch@2.7.0
└── xml2js@0.6.2

  Do you want to find out what packages you already have:
    Commands: 
      For local packages: npm list --depth=0
      For global packages: npm list -g --depth=0

After downloading all the directory's files to your local directory, installing all the npm packages above, and updating the 'accounts_keys.csv' file, you only need to run the start.js file using the command > node start.js,

How do you see your data? The scripts output to different files: appNames.json and appNames.csv. The content is the same for both, but you can use whichever one you want.

Note: The queries are coded to get information from the last week, but you can update them as you want.
