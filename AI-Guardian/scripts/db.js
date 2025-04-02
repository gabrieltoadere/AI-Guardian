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

    const query = 'SELECT * FROM users';
    db.query(query, [user, pass], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results); // User exists
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


app.patch('/update-allergens', async (req, res) => {
    try {
        const { userId, allergens } = req.body;
        db.query(
        'UPDATE users SET allergens = $1 WHERE id = $2',
        [JSON.stringify(allergens), userId] 
      );
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update allergens" });
    }
  });

// Save user name
app.post('/api/user', (req, res) => {
    const { userId, name } = req.body;
    db.query('UPDATE users SET name = ? WHERE id = ?', [name, userId], (err) => {
      if (err) return res.status(500).send(err);
      res.send({ message: "User name updated" });
    });
  });
  
  // Get user name
  app.get('/api/user/:userId', (req, res) => {
    db.query('SELECT name FROM users WHERE id = ?', [req.params.userId], (err, results) => {
      if (err) return res.status(500).send(err);
      const name = results[0]?.name || "";
      res.send({ name });
    });
  });

  // Save user allergen preferences
app.post('/api/preferences', (req, res) => {
    const { userId, allergens } = req.body;
    const allergensJSON = JSON.stringify(allergens);

    db.query('UPDATE users SET allergens = ? WHERE id = ?', [allergensJSON, userId], (err) => {
        if (err) {
            console.error('Error saving preferences:', err);
            return res.status(500).json({ error: 'Failed to save preferences' });
        }
        res.json({ message: 'Preferences saved' });
    });
});

// Get user allergen preferences
app.get('/api/preferences/:userId', (req, res) => {
    const { userId } = req.params;

    db.query('SELECT allergens FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error retrieving preferences:', err);
            return res.status(500).json({ error: 'Failed to load preferences' });
        }

        const prefs = results[0]?.allergens ? JSON.parse(results[0].allergens) : [];
        res.json(prefs);
    });
});

// Save scan history
app.post('/api/scan-history', (req, res) => {
    const { userId, product } = req.body;

    const query = `
        INSERT INTO scan_history (user_id, product_name, ingredients, date)
        VALUES (?, ?, ?, NOW())
    `;
    db.query(query, [userId, product.name, JSON.stringify(product.ingredients)], (err) => {
        if (err) {
            console.error('Error saving scan history:', err);
            return res.status(500).json({ error: 'Failed to save scan history' });
        }
        res.json({ message: 'Scan saved' });
    });
});

// Get scan history
app.get('/api/scan-history/:userId', (req, res) => {
    const { userId } = req.params;

    const query = `
        SELECT product_name, ingredients, scanned_at
        FROM scan_history
        WHERE user_id = ?
        ORDER BY scanned_at DESC
    `;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching scan history:', err);
            return res.status(500).json({ error: 'Failed to fetch history' });
        }
        res.json(results);
    });
});




// here i am working on everything to do with OpenAI
app.get('/api/scan-history/:userId/latest', (req, res) => {
    const { userId } = req.params;
    const query = `
      SELECT product_name, ingredients
      FROM scan_history
      WHERE user_id = ?
      ORDER BY scanned_at DESC
      LIMIT 1
    `;
  
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error fetching latest scan:", err);
        return res.status(500).json({ error: "Database error" });
      }
      if (results.length === 0) {
        return res.json({ product_name: "", ingredients: "" });
      }

      const latest = results[0];
      res.json({
        product_name: latest.product_name,
        ingredients: JSON.parse(latest.ingredients)
      });
    });
  });
  



app.use(express.static(path.join(__dirname,'scripts')));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})

