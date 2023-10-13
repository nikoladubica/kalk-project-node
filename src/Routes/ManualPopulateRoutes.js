const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

// Define a route to manually trigger data population
router.post('/', (req, res) => {
    // Run the data population script
    // TODO!! Put full path on the server
    const script = spawn('node', ['/Users/macbook/Sites/kalk-project-node/src/Scripts/populatePurchaseIdsAndInvoices.js']);

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

module.exports = router;
