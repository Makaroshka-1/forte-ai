const express = require('express');
const mysql = require('mysql');

const app = express();

// BUG 1: Hardcoded database credentials
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin123',
    database: 'production_db'
});

// BUG 2: SQL Injection vulnerability
app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const query = `SELECT * FROM users WHERE id = ${userId}`;

    // BUG 3: No error handling
    db.query(query, (err, results) => {
        res.json(results);
    });
});

// BUG 4: Exposing sensitive data
app.get('/api/config', (req, res) => {
    res.json({
        apiKey: 'sk-1234567890abcdef',
        secretToken: 'my-secret-token',
        adminPassword: 'super-secret'
    });
});

// BUG 5: No input validation
app.post('/api/transfer', (req, res) => {
    const amount = req.body.amount;
    const toAccount = req.body.toAccount;

    // Direct database update without validation
    db.query(`UPDATE accounts SET balance = balance - ${amount} WHERE id = 1`);
    db.query(`UPDATE accounts SET balance = balance + ${amount} WHERE id = ${toAccount}`);

    res.json({ success: true });
});

// BUG 6: Missing port configuration
app.listen(3000);
