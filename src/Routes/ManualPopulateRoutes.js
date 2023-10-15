const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const { PROD } = require('./../config');
const { populateInvoiceLines } = require('../Scripts/populateInvoiceLines');

// Define a route to manually trigger data population
router.post('/', (req, res) => {
    // Run the data population script
    let script = null;

    if (PROD === true) {
        // Server path
        script = spawn('node', ['/var/www/kalk-project-node/src/Scripts/populatePurchaseIdsAndInvoices.js']);
    } else {
        // Local path
        script = spawn('node', ['/Users/macbook/Sites/kalk-project-node/src/Scripts/populatePurchaseIdsAndInvoices.js']);
    }

    script.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    script.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    script.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        if (code === 0) {
            res.status(200).json({ message: 'Data population started successfully.' });
        } else {
            res.status(500).json({ error: 'Data population failed.' });
        }
    });
});

// Define a route to manually trigger data population
router.post('/invoice-lines', (req, res) => {
    // Run the data population script
    let script = null;

    populateInvoiceLines(parseInt(req.query.id))

    // if (PROD === true) {
    //     // Server path
    //     script = spawn('node', ['/var/www/kalk-project-node/src/Scripts/populateInvoiceLines.js']);
    // } else {
    //     // Local path
    //     script = spawn('node', ['/Users/macbook/Sites/kalk-project-node/src/Scripts/populateInvoiceLines.js']);
    // }

    // script.stdout.on('data', (data) => {
    //     console.log(`stdout: ${data}`);
    // });

    // script.stderr.on('data', (data) => {
    //     console.error(`stderr: ${data}`);
    // });

    // script.on('close', (code) => {
    //     console.log(`child process exited with code ${code}`);
    //     if (code === 0) {
    //         res.status(200).json({ message: 'Data population started successfully.' });
    //     } else {
    //         res.status(500).json({ error: 'Data population failed.' });
    //     }
    // });
});

module.exports = router;
