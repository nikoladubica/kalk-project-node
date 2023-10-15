const PurchaseInvoices = require('../Models/PurchaseInvoicesModel');
const InvoiceLines = require('../Models/InvoiceLinesModel');
const externalApiService = require('../Services/externalApiService');
const { setInvoiceLinesValues } = require('../Helpers/helper');
const sequelize = require('../Config/database');
const { XMLParser } = require("fast-xml-parser");

async function populateInvoiceLines(purchaseId) {
    try {
        // Fetch data from the external API
        const purchaseInvoicesData = await externalApiService.fetchPurchaseInvoicesByPurchaseId(purchaseId);

        // Synchronize the model with the database (create the table if it doesn't exist)
        await sequelize.sync();

        console.log(purchaseInvoicesData)
        const apiData = purchaseInvoicesData;
        const parser = new XMLParser();
        let apiDataObj = parser.parse(apiData);

        const invoice = apiDataObj['env:DocumentEnvelope']['env:DocumentBody']['Invoice'];
        const invoiceLine = invoice['cac:InvoiceLine']

        const accountingSupplierParty = invoice !== undefined && invoice['cac:AccountingSupplierParty'] ? invoice['cac:AccountingSupplierParty']['cac:Party'] : "";

        try {
            for (const item of invoiceLine) {
                await InvoiceLines.create(setInvoiceLinesValues(purchaseId, item));
            }
        } catch(error) {
            console.log("invoiceLine in not an array. ", error);

            try {
                await InvoiceLines.create(setInvoiceLinesValues(purchaseId, invoiceLine));
            } catch(error2) {
                console.log("invoiceLine in not an object. ", error2);
            }
        }

        console.log('Invoice lines populated successfully.');
    } catch (error) {
        console.error('Error populating invoice lines:', error);
    }
}

// Call the function to populate invoice lines
// populateInvoiceLines();

module.exports = {
    populateInvoiceLines,
}
