const API_KEY = 'DELETED';
const GET_ALL_PURCHASE_IDS = 'https://efaktura.mfin.gov.rs/api/publicApi/purchase-invoice/ids';
const apiUrl =               'https://efaktura.mfin.gov.rs/api/publicApi/purchase-invoice/ids?status=New'
const GET_PURCHASE_ID_XML = 'https://efaktura.mfin.gov.rs/api/publicApi/purchase-invoice/xml';

const axios = require('axios');
const mysql = require('mysql2');
const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
const fs = require('fs');
const Readable = require('stream').Readable;

// Creating a config for a DB connection
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root1000',
    database: 'kalk-project'
};

// Headers and params for the request
const headers = {
    "accept": "application/json;charset=UTF-8",
    "ApiKey": API_KEY
};

function setPurchaseIds(purchase_status) {
    const purchase_date_from = '2023-09-23T00:00:00';
    const purchase_date_to = '2023-09-24T00:00:00';

    const params = {
        status: "Seen",
        dateFrom: purchase_date_from,
        dateTo: purchase_date_to
    };
    
    const connection = mysql.createConnection(dbConfig);
    connection.connect();

    // Making a post request to get new purchase invoice ids
    axios.post(`${GET_ALL_PURCHASE_IDS}?dateFrom=${params.dateFrom}&dateTo=${params.dateTo}`, null, {headers}).then(response => {
        const apiData = response.data.PurchaseInvoiceIds;
        console.log(response)

        apiData.forEach((item, index) => {
            const query = 'INSERT INTO new_purchase_ids (purchase_invoice_id) VALUES (?)';
            const values = [item];
        
            connection.query(query, values, (error, results, fields) => {
                if (error) {
                    console.error('Error inserting data into MySQL', error);
                }
            });
        });

        connection.end();
    })
    .catch(error => {
        console.error('API request failed', error);
        connection.end();
    });
}

function setPurchaseInvoice(purchase_id) {
    const connection = mysql.createConnection(dbConfig);
    connection.connect();

    // Making a post request to get new purchase invoice ids
    axios.get(`${GET_PURCHASE_ID_XML}?invoiceId=${purchase_id}`, {headers}).then(response => {
        const apiData = response.data;

        const parser = new XMLParser();
        let apiDataObj = parser.parse(apiData);

        const AccountingCustomerParty = apiDataObj['env:DocumentEnvelope']['env:DocumentBody']['Invoice']['cac:AccountingCustomerParty']['cac:Party'];
        const AccountingSupplierParty = apiDataObj['env:DocumentEnvelope']['env:DocumentBody']['Invoice']['cac:AccountingSupplierParty']['cac:Party'];
        const invoice = apiDataObj['env:DocumentEnvelope']['env:DocumentBody']['Invoice']

        const query = `INSERT INTO purchase_invoices (id, issue_date, due_date, delivery_date, supplier_name, cost_minus_vat, vat, cost_total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            purchase_id, 
            invoice['cbc:IssueDate'], 
            invoice['cbc:DueDate'], 
            invoice['cac:Delivery']['cbc:ActualDeliveryDate'],
            AccountingSupplierParty['cac:PartyName'] ? AccountingSupplierParty['cac:PartyName']['cbc:Name'] : '',
            invoice['cac:TaxTotal']['cac:TaxSubtotal']['cbc:TaxableAmount'],
            invoice['cac:TaxTotal']['cac:TaxSubtotal']['cbc:TaxAmount'],
            invoice['cac:LegalMonetaryTotal']['cbc:PayableAmount']
        ];
    
        connection.query(query, values, (error, results, fields) => {
            if (error) {
                console.error('Error inserting data into MySQL', error);
            }
        });

        connection.end();
    })
    .catch(error => {
        console.error('API request failed', error);
        connection.end();
    });
}

function setInvoiceLine(purchase_id) {
    const connection = mysql.createConnection(dbConfig);
    connection.connect();

    // Making a post request to get new purchase invoice ids
    axios.get(`${GET_PURCHASE_ID_XML}?invoiceId=${purchase_id}`, {headers}).then(response => {
        const apiData = response.data;

        const parser = new XMLParser();
        let apiDataObj = parser.parse(apiData);

        const AccountingCustomerParty = apiDataObj['env:DocumentEnvelope']['env:DocumentBody']['Invoice']['cac:AccountingCustomerParty']['cac:Party'];
        const AccountingSupplierParty = apiDataObj['env:DocumentEnvelope']['env:DocumentBody']['Invoice']['cac:AccountingSupplierParty']['cac:Party'];
        const Invoice = apiDataObj['env:DocumentEnvelope']['env:DocumentBody']['Invoice']
        const InvoiceLine = Invoice['cac:InvoiceLine']

        function setValues(id, item) {
            const priceVatDiscount = () => {
                const taxPercent = item['cac:Item'] ? item['cac:Item']['cac:ClassifiedTaxCategory']['cbc:Percent'] : 0;
                const quantity = item['cbc:InvoicedQuantity'];
                const price = item['cac:Price'] ? item['cac:Price']['cbc:PriceAmount'] : 0;
                let taxableAmount = item['cbc:LineExtensionAmount'];

                if (item['cac:TaxTotal']) {
                    const taxAmount = item['cac:TaxTotal']['cac:TaxSubtotal']['cbc:TaxAmount'];
                    taxableAmount = item['cac:TaxTotal']['cac:TaxSubtotal']['cbc:TaxableAmount'];

                    const taxPerItem = taxAmount / quantity;
                    const taxablePerItem = taxableAmount / quantity;

                    return parseFloat(taxPerItem + taxablePerItem);
                } else {
                    const floatPercentage = (100 + taxPercent) / 100;
                    const taxPerItem = ((price * floatPercentage) - price);
                    const taxablePerItem = taxableAmount / quantity;

                    return parseFloat(taxPerItem + taxablePerItem);
                }
            }

            const taxAmount = () => {
                if (item['cac:TaxTotal']) {
                    return item['cac:TaxTotal']['cac:TaxSubtotal']['cbc:TaxAmount'];
                } else {
                    const taxPercent = item['cac:Item'] ? item['cac:Item']['cac:ClassifiedTaxCategory']['cbc:Percent'] : 0;
                    const price = item['cac:Price'] ? item['cac:Price']['cbc:PriceAmount'] : 0;
                    const quantity = item['cbc:InvoicedQuantity'];

                    const floatPercentage = (100 + taxPercent) / 100;

                    return ((price * floatPercentage) - price) * quantity;
                }
            }

            const taxableAmount = () => {
                if (item['cac:TaxTotal']) {
                    return item['cac:TaxTotal']['cac:TaxSubtotal']['cbc:TaxableAmount'];
                } else {
                    return item['cbc:LineExtensionAmount']
                }
            }

            const multiplierFactorNumeric = () => {
                if (item['cac:AllowanceCharge']) {
                    return item['cac:AllowanceCharge']['cac:MultiplierFactorNumeric'];
                } else {
                    return 1;
                }
            }

            const allowanceChargeAmount = () => {
                if (item['cac:AllowanceCharge']) {
                    return item['cac:AllowanceCharge']['cac:Amount'];
                } else {
                    return 0;
                }
            }

            const name = () => {
                if (item['cac:Item']) {
                    return item['cac:Item']['cbc:Name'];
                } else {
                    return "";
                }
            }

            const taxID = () => {
                if (item['cac:Item']) {
                    return item['cac:Item']['cac:ClassifiedTaxCategory']['cbc:ID'];
                } else {
                    return "";
                }
            }

            const taxPercent = () => {
                if (item['cac:Item']) {
                    return item['cac:Item']['cac:ClassifiedTaxCategory']['cbc:Percent'];
                } else {
                    return 0;
                }
            }

            const priceAmount = () => {
                if (item['cac:Price']) {
                    return item['cac:Price']['cbc:PriceAmount'];
                } else {
                    return 0;
                }
            }

            return [
                id,
                item['cbc:InvoicedQuantity'],
                name(),
                taxID(),
                taxPercent(),
                taxAmount(),
                taxableAmount(),
                priceAmount(),
                multiplierFactorNumeric(),
                allowanceChargeAmount(),
                priceVatDiscount()
            ]
        }

        // Trying this if invoice has multiple items
        try {
            InvoiceLine.forEach(item => {
                const query = `INSERT INTO invoice_lines (purchase_invoice_id, quantity, name, tax_category, tax_percent, tax_total, taxable_amount, 
                               price_amount, discount_percentage, total_discount, price_vat_discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const values = setValues(purchase_id, item)
    
                connection.query(query, values, (error, results, fields) => {
                    if (error) {
                        console.error('Error inserting data into MySQL', error);
                    }
                });
            })
        } catch(error) {
            // Trying this if invoice has only one item and it's not actually an array
            try {
                const query = `INSERT INTO invoice_lines (purchase_invoice_id, quantity, name, tax_category, tax_percent, tax_total, taxable_amount, 
                    price_amount, discount_percentage, total_discount, price_vat_discount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const values = setValues(purchase_id, InvoiceLine)

                connection.query(query, values, (error, results, fields) => {
                    if (error) {
                        console.error('Error inserting data into MySQL', error);
                    }
                });
            } catch(error2) {
                // console.log(error2)
            }
        }
        
        connection.end();
    })
    .catch(error => {
        console.error('API request failed', error);
        connection.end();
    });
}

// setPurchaseIds('New');
// setInvoiceLine(95333680);
// setInvoiceLine(95333650);
// setInvoiceLine(95261995);
setInvoiceLine(92027821);


// setPurchaseInvoice(92027821);
// setPurchaseInvoice(92034162);
// setPurchaseInvoice(92062207);
// setPurchaseInvoice(92034230);
// setPurchaseInvoice(92062201);
  