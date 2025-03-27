const mysql = require('mysql');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 5501;



app.use(cors());
app.use(bodyParser.json());


const db = mysql.createConnection({
    host: 'webcourse.cs.nuim.ie',
    user:'u240669',
    password:'reeGeewo1egeeCha',
    database:'cs230_u240669',
});

db.connect((err) => {
    if(err) {
        console.error("error connecting to the database:",err);
    } else {
        console.log("Connected to db")
    }
    
});

app.post('/login', (req,res) => {
    const { user, pass } = req.body; // Destructure `user` and `pass` from frontend

    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    db.query(query, [user, pass], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // ✅ Send success/failure response
        if (results.length > 0) {
            res.json({ success: true, user: results[0] }); // User exists
        } else {
            res.json({ success: false }); // Invalid credentials
        }
    });
});


app.post('/allergens', (req, res) => {
    const id = req.body;
    const query = 'SELECT allergens FROM users WHERE id = ?'; // Adjust table/column names

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to fetch allergens' });
        }
        res.json(results); // Returns array like [{ allergen_name: "Peanuts" }, ...]
    });
});


app.use(express.static(path.join(__dirname,'scripts')));



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})

