const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');

// Function to read and parse the JSON file
const readJsonFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading or parsing the JSON file:', err);
    process.exit(1);
  }
};

// Function to write the CSV file
const writeCsvFile = async (records, filePath) => {
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'accountNumber', title: 'Account Number' },
      { id: 'eventType', title: 'Event Type' },
      { id: 'appName', title: 'App Name' },
      { id: 'entityGuid', title: 'Entity GUID' },
    ],
  });

  await csvWriter.writeRecords(records);
  console.log(`Results saved to ${filePath}`);
};

// Main function to process the JSON data and convert it to CSV
const main = async () => {
  const data = readJsonFile('appNames.json');
  
  const records = [];

  data.forEach(item => {
    const accountNumber = item.accountNumber;
    const eventType = item.eventType;

    item.data.forEach(dataEntry => {
      const appNameEntityGuidPairs = dataEntry['uniques.appName, entityGuid'];

      if (Array.isArray(appNameEntityGuidPairs) && appNameEntityGuidPairs.length > 0) {
        appNameEntityGuidPairs.forEach(pair => {
          records.push({
            accountNumber,
            eventType,
            appName: pair[0],
            entityGuid: pair[1],
          });
        });
      } else {
        // If there are no appName/entityGuid pairs, add an empty record
        records.push({
          accountNumber,
          eventType,
          appName: '',
          entityGuid: '',
        });
      }
    });
  });

  await writeCsvFile(records, 'appNames.csv');
};

// Execute the main function
main();
