const PurchaseInvoices = require('../Models/PurchaseInvoicesModel');

async function getAllPurchaseInvoices(req, res) {
    try {
        const purchaseInvoices = await PurchaseInvoices.findAll();
        res.status(200).json(purchaseInvoices);
    } catch (error) {
        console.error('Error fetching purchase invoices: ', error);
        res.status(500).json({ error: 'Error fetching purchase invoices.' });
    }
}

module.exports = {
    getAllPurchaseInvoices,
};