const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());

// Creating a config for a DB connection
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root1000',
    database: 'kalk-project'
};

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});

app.get('/purchase-invoices', (request, response) => {
    const connection = mysql.createConnection(dbConfig);
    connection.connect();

    const query = `SELECT * FROM purchase_invoices`;

    connection.query(query, (error, results, fields) => {
        response.send(results);

        if (error) {
            console.error('Error inserting data into MySQL', error);
        }
    });

    connection.end();
});

app.get('/new-purchase-ids', (request, response) => {
    const connection = mysql.createConnection(dbConfig);
    connection.connect();

    const query = `SELECT * FROM new_purchase_ids`;

    connection.query(query, (error, results, fields) => {
        response.send(results);

        if (error) {
            console.error('Error inserting data into MySQL', error);
        }
    });

    connection.end();
});

app.get('/invoice-lines', (request, response) => {
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