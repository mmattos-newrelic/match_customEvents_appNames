const fs = require('fs');
const axios = require('axios');
const csv = require('csv-parser');

// Function to read and parse the input JSON file
const readInputFile = () => {
  try {
    const data = fs.readFileSync('bkp_output.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading or parsing the input file:', err);
    process.exit(1);
  }
};

// Function to read API keys from the CSV file
const readApiKeys = () => {
  return new Promise((resolve, reject) => {
    const apiKeys = {};
    fs.createReadStream('accounts_keys.csv')
      .pipe(csv())
      .on('data', (row) => {
        apiKeys[row.accountNumber] = row.apiKey;
      })
      .on('end', () => {
        resolve(apiKeys);
      })
      .on('error', (err) => {
        reject('Error reading the CSV file:', err);
      });
  });
};

// Function to perform the API call
const performApiCall = async (eventType, accountNumber, apiKey) => {
  const query = `
    {
      actor {
        account(id: ${accountNumber}) {
          nrql(
            timeout: 10
            query: "from ${eventType} select uniques(tuple(appName, entityGuid))"
          ) {
            results
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      'https://api.newrelic.com/graphql',
      { query },
      {
        headers: {
          'Content-Type': 'application/json',
          'API-Key': apiKey
        }
      }
    );
    return response.data.data.actor.account.nrql.results;
  } catch (err) {
    console.error(`Error making the API call for eventType: ${eventType} and accountNumber: ${accountNumber}`, err);
    return null;
  }
};

// Main function to process data and perform API calls
const main = async () => {
  const data = readInputFile();
  const apiKeys = await readApiKeys();
  
  // Check if appNames.json exists and remove it if it does
  if (fs.existsSync('appNames.json')) {
    fs.unlinkSync('appNames.json');
    console.log('Existing appNames.json file deleted.');
  }

  // Debugging: print out the structure of the data and API keys
  console.log('Data read from file:', data);
  console.log('API keys:', apiKeys);
  
  const results = [];

  // Iterate over each item in the JSON array
  for (const item of data) {
    const accountNumber = item.accountNumber;
    const apiKey = apiKeys[accountNumber];

    if (!apiKey) {
      console.error(`API key not found for accountNumber: ${accountNumber}`);
      continue;
    }

    const eventTypes = item.data.actor.nrql.results[0]['uniques.usage.event.type'] || [];

    if (!Array.isArray(eventTypes)) {
      console.error('Invalid data format: eventTypes is not an array');
      continue;
    }

    for (const eventType of eventTypes) {
      console.log(`Processing eventType: ${eventType} for accountNumber: ${accountNumber} with API key: ${apiKey}`);
      const apiResults = await performApiCall(eventType, accountNumber, apiKey);
      if (apiResults) {
        results.push({
          accountNumber,
          eventType,
          data: apiResults
        });
      }
    }
  }

  // Write the results to the output file
  fs.writeFileSync('appNames.json', JSON.stringify(results, null, 2), 'utf8');
  console.log('Results saved to appNames.json');
};

// Execute the main function
main();
