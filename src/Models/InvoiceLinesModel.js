const { DataTypes } = require('sequelize');
const db = require('../Config/database');

const InvoiceLines = db.define('InvoiceLines', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    purchaseInvoiceId: {
        type: DataTypes.INTEGER
    },
    quantity: {
        type: DataTypes.INTEGER
    },
    name: {
        type: DataTypes.STRING
    },
    taxCategory: {
        type: DataTypes.STRING
    },
    taxPercent: {
        type: DataTypes.INTEGER
    },
    taxTotal: {
        type: DataTypes.FLOAT(10, 2)
    },
    taxableAmount: {
        type: DataTypes.FLOAT(10, 2)
    },
    priceAmount: {
        type: DataTypes.FLOAT(10, 2)
    },
    discountPercentage: {
        type: DataTypes.FLOAT(10, 2)
    },
    totalDiscount: {
        type: DataTypes.FLOAT(10, 2)
    },
    priceVatDiscount: {
        type: DataTypes.FLOAT(10, 2)
    },
});

module.exports = InvoiceLines;