const PurchaseIds = require('../Models/PurchaseIdsModel');

async function getAllPurchaseIds(req, res) {
    try {
        const purchaseIds = await PurchaseIds.findAll();
        res.status(200).json(purchaseIds);
    } catch (error) {
        console.error('Error fetching purchase IDs:', error);
        res.status(500).json({ error: 'Error fetching purchase IDs.' });
    }
}

module.exports = {
    getAllPurchaseIds,
};

