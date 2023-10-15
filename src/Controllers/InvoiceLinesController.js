const InvoiceLines = require('../Models/InvoiceLinesModel');

async function getAllInvoiceLines(req, res) {
    try {
        const invoiceLines = await InvoiceLines.findAll({
            where: {
                purchaseInvoiceId: parseInt(req.query.id)
            }
        });
        res.status(200).json(invoiceLines);
    } catch (error) {
        console.error('Error fetching invoice lines: ', error);
        res.status(500).json({ error: 'Error fetching invoice lines.' });
    }
}

module.exports = {
    getAllInvoiceLines,
};