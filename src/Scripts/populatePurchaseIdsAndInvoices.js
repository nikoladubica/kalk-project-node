const PurchaseIds = require('../Models/PurchaseIdsModel');
const PurchaseInvoices = require('../Models/PurchaseInvoicesModel');
const externalApiService = require('../Services/externalApiService');
const sequelize = require('../Config/database');
const { XMLParser } = require("fast-xml-parser");

async function populatePurchaseIdsAndInvoices() {
    try {
        // Fetch data from the external API
        const purchaseIdsData = await externalApiService.fetchPurchaseIdsFromExternalAPI();

        // Synchronize the model with the database (create the table if it doesn't exist)
        await sequelize.sync();

        // Iterate through PurchaseIds
        for (const purchaseId of purchaseIdsData) {
            // Fetch PurchaseInvoices associated with this PurchaseId from the external API
            const purchaseInvoicesData = await externalApiService.fetchPurchaseInvoicesByPurchaseId(purchaseId.id);

            // Create a new PurchaseIds record
            const purchaseIdsRecord = await PurchaseIds.create({ id: purchaseId.id });

            // Insert the associated PurchaseInvoices
            const apiData = purchaseInvoicesData;

            const parser = new XMLParser();
            let apiDataObj = parser.parse(apiData);

            const invoice = apiDataObj['env:DocumentEnvelope']['env:DocumentBody']['Invoice'];
            const accountingSupplierParty = invoice !== undefined && invoice['cac:AccountingSupplierParty'] ? invoice['cac:AccountingSupplierParty']['cac:Party'] : "";

            await PurchaseInvoices.create({
                id: purchaseId.id,
                issueDate: invoice['cbc:IssueDate'],
                dueDate: invoice['cbc:DueDate'],
                deliveryDate: invoice['cac:Delivery']['cbc:ActualDeliveryDate'],
                supplierName: accountingSupplierParty['cac:PartyName'] ? accountingSupplierParty['cac:PartyName']['cbc:Name'] : '',
                costMinusVat: invoice['cac:TaxTotal']['cac:TaxSubtotal']['cbc:TaxableAmount'],
                vat: invoice['cac:TaxTotal']['cac:TaxSubtotal']['cbc:TaxAmount'],
                totalCost: invoice['cac:LegalMonetaryTotal']['cbc:PayableAmount']
            });
        }

        console.log('Purchase IDs and Invoices populated successfully.');
    } catch (error) {
        console.error('Error populating purchase IDs:', error);
    }
}

// Call the function to populate purchase IDs and invoices
populatePurchaseIdsAndInvoices();

module.exports = {
    populatePurchaseIdsAndInvoices,
}
