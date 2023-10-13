const mysql = require('mysql2');
const express = require('express');
const router = express.Router();

router.get('/invoice-lines', (request, response) => {
    const connection = mysql.createConnection(dbConfig);
    connection.connect();

    const query = `SELECT * FROM invoice_lines WHERE purchase_invoice_id = ${request.query.purchase_invoice_id}`;

    connection.query(query, (error, results, fields) => {
        response.send(results);

        if (error) {
            console.error('Error inserting data into MySQL', error);
        }
    });

    connection.end();
});

module.exports = router;