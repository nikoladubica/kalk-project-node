const express = require('express');
const router = express.Router();
const purchaseInvoicesController = require('../Controllers/PurchaseInvoicesController');

// Defined PurchaseIds routes
router.get('/', purchaseInvoicesController.getAllPurchaseInvoices);

module.exports = router;