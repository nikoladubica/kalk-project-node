const { DataTypes } = require('sequelize');
const db = require('../Config/database');
const PurchaseInvoices = require('./PurchaseInvoicesModel');

const PurchaseIds = db.define('PurchaseIds', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
});

PurchaseIds.hasOne(PurchaseInvoices, { foreignKey: 'id' });

module.exports = PurchaseIds;