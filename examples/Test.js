/**
*
* Run unit tests
* 
* This is to facilitate running the tests from a debugger.  Mostly in Cloud9.
* 
* @license MIT
* @author <steven@velozo.com>
*/
var tmpMochaOptions = (
    {
        // Test UI
        ui: 'tdd',
        // Pattern to match for tests
        grep: /(.*)/,
        // Whether grep is a match or exclusion
        invert: false,
        timeout: 2500,
        fullTrace: true,
        checkLeaks: true
    }
);

var libMocha = require('mocha');
var libFS = require('fs');
var libPath = require('path');


// Instantiate a Mocha instance with TDD as the UI.
var tmpTestRunner = new libMocha(tmpMochaOptions);

// Get all the tests in the test folder
var tmpTestFolder = `${__dirname}/../test`;


// Add each .js file to the mocha instance
libFS.readdir(tmpTestFolder,
    (pError, pFiles)=>
    {
        pFiles.filter
        (
            (pFile)=>
            {
                // Only keep the .js files
                return pFile.substr(-3) === '.js';
            }
        ).forEach
        (
            (pFile)=>
            {
                // Add the file to the test runner
                tmpTestRunner.addFile(libPath.join(tmpTestFolder, pFile));
            }
        );
        
        // Run the tests.
        tmpTestRunner.run
        (
            (pFailures)=>
            {
                // exit with non-zero status if there were failures
                process.on('exit', () => { process.exit(pFailures); });
            }
        );
    }
);
