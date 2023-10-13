const express = require('express');
// const cors = require('cors');
const app = express();

// app.use(cors());

// Middleware setup, route definitions, error handling, etc.

// Initialize a cron job to get new purchase IDs every day
require('./Cron/purchaseIdsCron');

const purchaseIdsRoutes = require('./Routes/PurchaseIdsRoutes');
app.use('/api/purchase-ids', purchaseIdsRoutes);

const purchaseInvoicesRoutes = require('./Routes/PurchaseInvoicesRoutes');
app.use('/api/purchase-invoices', purchaseInvoicesRoutes);

const manualPopulateRoute = require('./Routes/ManualPopulateRoutes'); // Import the new route
app.use('/api/fetch-external', manualPopulateRoute);

module.exports = app;
