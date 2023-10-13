const { DataTypes } = require('sequelize');
const db = require('../Config/database');

const PurchaseInvoices = db.define('PurchaseInvoices', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    issueDate: {
        type: DataTypes.DATE
    },
    dueDate: {
        type: DataTypes.DATE
    },
    deliveryDate: {
        type: DataTypes.DATE
    },
    supplierName: {
        type: DataTypes.STRING
    },
    costMinusVat: {
        type: DataTypes.FLOAT(10, 2)
    },
    vat: {
        type: DataTypes.FLOAT(10, 2)
    },
    totalCost: {
        type: DataTypes.FLOAT(10, 2)
    },
});

module.exports = PurchaseInvoices;