const express = require('express');
const router = express.Router();
const purchaseIdsController = require('../Controllers/PurchaseIdsController');

// Defined PurchaseIds routes
router.get('/', purchaseIdsController.getAllPurchaseIds);

module.exports = router;