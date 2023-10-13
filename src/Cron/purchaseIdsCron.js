const cron = require('node-cron');
// const { populatePurchaseIdsAndInvoices } = require('../Scripts/populatePurchaseIdsAndInvoices');

cron.schedule('00 23 * * *', () => {
    console.log('Running a job at 23:00 at Europe/Belgrade timezone');
    // populatePurchaseIdsAndInvoices();
}, {
    scheduled: true,
    timezone: "Europe/Belgrade"
});