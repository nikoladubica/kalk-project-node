const axios = require('axios');
const sequelize = require('../Config/database');
const { API_KEY } = require('./../config');
const { GET_ALL_PURCHASE_IDS, GET_PURCHASE_ID_XML } = require('./../constants');
const PurchaseIds = require('../Models/PurchaseIdsModel');
const PurchaseInvoices = require('../Models/PurchaseInvoicesModel');

const headers = {
    "accept": "application/json;charset=UTF-8",
    "ApiKey": API_KEY
};

// TODO!! Add parameter "purchase_status" to this function, so we can provide multiple status options, not just "New"
async function fetchPurchaseIdsFromExternalAPI() {
    try {
        // Retrieve existing IDs from the database
        const existingIds = await PurchaseIds.findAll({ attributes: ['id'] });

        // TODO!! Should use "New", but we don't have any new currently
        // const response = await axios.post(`${GET_ALL_PURCHASE_IDS}?status=New`, null, { headers });
        const response = await axios.post(`${GET_ALL_PURCHASE_IDS}?dateFrom=2023-10-01&dateTo=2023-10-10`, null, { headers });

        const apiData = response.data.PurchaseInvoiceIds;
        let data = [];

        apiData.forEach(element => {
            // Check if IDs already exist in DB
            const idExists = existingIds.some(existingId => existingId.id === element);
            if (!idExists) {
                data.push({
                    id: element
                });
            }
        });

        return data;
    } catch (error) {
        console.error('Error fetching data from the external API:', error);
        throw error;
    } finally {
        // Close temporarily disabled since we need the connection open
        // sequelize.close(); // Close the database connection
    }
}

async function fetchPurchaseInvoicesByPurchaseId(purchaseId) {
    try {
        // Retrieve existing IDs from the database
        const existingIds = await PurchaseInvoices.findAll({ attributes: ['id'] });

        const response = await axios.get(`${GET_PURCHASE_ID_XML}?invoiceId=${purchaseId}`, { headers });
        const apiData = response.data;
        let data = [];

        // Check if IDs already exist in DB
        const idExists = existingIds.some(existingId => existingId.id === purchaseId);
        if (!idExists) {
            return apiData;
        }
    } catch (error) {
        console.error('Error fetching data from the external API:', error);
        throw error;
    } finally {
        // Close temporarily disabled since we need the connection open
        // sequelize.close(); // Close the database connection
    }
}

module.exports = {
    fetchPurchaseIdsFromExternalAPI,
    fetchPurchaseInvoicesByPurchaseId,
};
