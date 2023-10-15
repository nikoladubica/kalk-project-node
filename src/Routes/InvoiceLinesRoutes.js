const express = require('express');
const router = express.Router();
const invoiceLinesController = require('../Controllers/InvoiceLinesController');

// Defined PurchaseIds routes
router.get('/', invoiceLinesController.getAllInvoiceLines);

module.exports = router;