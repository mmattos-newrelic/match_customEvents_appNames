const fs = require('fs');
const { exec } = require('child_process');

// Function to execute a script and return a promise
const runScript = (scriptName) => {
  return new Promise((resolve, reject) => {
    exec(`node ${scriptName}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing ${scriptName}:`, error);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Error in ${scriptName}:`, stderr);
        reject(stderr);
        return;
      }
      console.log(`${scriptName} executed successfully.`);
      resolve(stdout);
    });
  });
};

// Function to check if a file exists
const checkFileExists = (filePath) => {
  return fs.promises.access(filePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
};

// Main function to execute the scripts in sequence
const main = async () => {
  try {
    // Execute the first script
    await runScript('1_getInfoFromNR_v1.js');

    // Check if bkp_output.json was created
    const bkpOutputExists = await checkFileExists('bkp_output.json');
    if (!bkpOutputExists) {
      console.error('bkp_output.json not found. Aborting the process.');
      process.exit(1);
    }

    // Execute the second script
    await runScript('2_match_evenType_appName_v3.js');

    // Check if appNames.json was created
    const appNamesExists = await checkFileExists('appNames.json');
    if (!appNamesExists) {
      console.error('appNames.json not found. Aborting the process.');
      process.exit(1);
    }

    // Execute the third script
    await runScript('3_convert_json_to_csv_output.js');
    
    console.log('All scripts executed successfully.');

  } catch (error) {
    console.error('An error occurred during the script execution:', error);
    process.exit(1);
  }
};

// Execute the main function
main();
