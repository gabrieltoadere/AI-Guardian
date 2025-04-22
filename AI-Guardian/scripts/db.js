const mysql = require('mysql');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 5501;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client("229386078489-ovi0bke1m73e26lm1397baqplj5rabgg.apps.googleusercontent.com");
const ndoemailer = require('nodemailer');
const crypto = require('crypto');



app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'scripts')));


const transporter = ndoemailer.createTransport({
  service: 'gmail',
  auth: {
    user:'groceryguardian@gmail.com',
    pass:'zspv wnsn pqlo nbbl'
  }
});


const db = mysql.createConnection({
    host: 'ai-guardian.mysql.database.azure.com',
    user:'aiGuard',
    password:'28-fourth-25',
    database:'aiguardian',
    port: 3306,
  ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
    if(err) {
        console.error("error connecting to the database:",err);
    } else {
        console.log("Connected to db")
    }
});


//google login
app.post('/auth/google', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "229386078489-ovi0bke1m73e26lm1397baqplj5rabgg.apps.googleusercontent.com"
    });

    const payload = ticket.getPayload();
    const { name, email } = payload;

    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Select error:', err);
        return res.status(500).json({ success: false, message: "Database query failed." });
      }

      if (results.length > 0) {
        const existingUser = results[0];
        return res.json({ success: true, user: existingUser });
      } else {
        db.query('INSERT INTO users (username, email) VALUES (?, ?)', [name, email], (err, insertResult) => {
          if (err) {
            console.error('Insert error:', err);
            return res.status(500).json({ success: false, message: "Failed to create user." });
          }


          db.query('SELECT * FROM users WHERE email = ?', [email], (err, newResults) => {
            if (err) {
              console.error('Fetch after insert error:', err);
              return res.status(500).json({ success: false, message: "User created but fetch failed." });
            }

            const user = newResults[0];
            return res.json({ success: true, user });
          });
        });
      }
    });
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ success: false, error: "Invalid token" });
  }
});

app.post('/forgot-password',(req,res) => {
  const {email} = req.body;

  const token = crypto.randomBytes(32).toString('hex');
  const expiration = new Date(Date.now() + 3600000);

  db.query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
    [token,expiration,email], (err,result) => {
      if(err) {
        return res.status(400).json({success: false ,message:'user not found'});
      }

      const resetLink = `http://127.0.0.1:5503/AI-Guardian/AI%20GUARDIAN%20Project/reset-password.html?token=${token}&email=${encodeURIComponent(email)}`;

      const mailOptions = {
        from: 'groceryguardian@gmail.com',
        to: 'gabriel.toadere@icloud.com',
        subject: 'Password reset link for Grocery Guardian',
        html:`<p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>`
      };

      transporter.sendMail(mailOptions, (err,info) => {
        if(err) {
          console.error('Email error: ', err);
          return res.status(500).json({success: false , message: 'failed to send email'});
        }


        res.json({success: true , message: 'Reset email sent'});
      })
    }
  )
});

app.post('/reset-password',(req,res) => {
  const { email,token,newPassword} = req.body;
  db.query(
    'SELECT * FROM users WHERE email =? AND reset_token = ? AND reset_token_expiry > UTC_TIMESTAMP()',
    [email,token],(err,results) => {
      console.log(token);
      if(err || results.length===0) {
        return res.status(400).json({ success: false, message: "Invalid or expired token" });
      }

      db.query(
        'UPDATE users SET password =?, reset_token=NULL,reset_token_expiry=NULL WHERE email=?',
        [newPassword,email],
        (err) => {
          if(err) {
            return res.status(500).json({success:false,message:'Failed to update password'});
          }

          res.json({success:true,message:'Password reset successful!'});
        }
      )
    }
  )
})


//I ADDED A ROUTE TO HANDLE CHANGES MADE TO SAFE OR UNSAFE FOODS
// Assuming we're using Express and have a db connection set up
app.post('/update-status', (req, res) => {
    const { scan_id, updatedStatus } = req.body;

    const query = 'UPDATE scan_history SET status=? WHERE scan_id=?';

    db.query(query,[updatedStatus,scan_id],(err,results) => {
        if(err) {
          console.err(err);
        }
        res.json(results);
    })
});


//CREATE A TABLE USING THIS CODE SO IGNORE
// CREATE TABLE purchase_history (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     user_id INT,
//     product_id VARCHAR(255),
//     product_name VARCHAR(255),
//     date_scanned DATE,
//     status VARCHAR(10)  -- should hold 'safe' or 'unsafe'
// );



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


app.post('/update-allergens', async (req, res) => {
  const { userId, allergens } = req.body;
  db.query(
    'UPDATE users SET allergens = ? WHERE id = ?',
    [JSON.stringify(allergens), userId],
    (err) => {
      if (err) {
        console.error("Error saving preferences:", err);
        return res.status(500).json({ error: "Failed to save preferences" });
      }
      res.status(200).json({ success: true });
    }
  );
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

  app.post('/reload/user',(req,res) => {
    const {id}= req.body;
    db.query('SELECT * FROM users WHERE id=?',[id] ,(err,results) => {
      if(err) {
        console.error("Error reloading user: " , err);
        return;
      }
      console.log(results[0]);
      res.json(results[0]);
    })
  })

  // Save user allergen preferences
app.post('/change-preferences', (req, res) => {
    const { id, allergens } = req.body;
    const allergensJSON = JSON.stringify(allergens);

    db.query('UPDATE users SET allergens = ? WHERE id = ?', [allergensJSON, id], (err) => {
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
    const query = 'SELECT allergens FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error retrieving preferences:', err);
            return res.status(500).json({ error: 'Failed to load preferences' });
        }

        const prefs = results[0]?.allergens ? JSON.parse(results[0].allergens) : [];
        res.json(prefs);
    });
});


app.post('/barcodeScan',(req,res) => {
  const { scannedProduct } = req.body;

  const query = `INSERT INTO scan_history
   (user_id, product_name, ingredients,potential_allergens,sugar_level,status,scan_date,quantity,price)
   VALUES (?,?,?,?,?,?,NOW(),?,?)`;

   db.query(query, [ scannedProduct.userId,scannedProduct.name , scannedProduct.ingredients,scannedProduct.potential_allergens,scannedProduct.sugar_level,scannedProduct.status,scannedProduct.quantity,scannedProduct.price] ,(err,results) => {
      if(err) {
        console.error('error storing scan', err);
      }
      console.log(results);
  });
});

app.post('/loadHistory',(req,res) => {
  const { userId } = req.body;

  const query = 'SELECT * FROM scan_history WHERE user_id=?';

  db.query(query, [ userId ],(err,results) => {
    if(err) {
      console.err('error getting scan history',err);
    }
    res.json(results);
  });
})

// Save scan history
app.post('/api/scan-history', (req, res) => {
    const { userId, product } = req.body;

    const query = `
        INSERT INTO scanHistory (user_id, product_name, ingredients, date)
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
        SELECT product_name, ingredients, date
        FROM scanHistory
        WHERE user_id = ?
        ORDER BY date DESC
    `;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching scan history:', err);
            return res.status(500).json({ error: 'Failed to fetch history' });
        }
        return res.json(results);
    });
});




// here i am working on everything to do with OpenAI
app.get('/api/scan-history/:userId/latest', (req, res) => {
    const { userId } = req.params;
    const query = `
      SELECT product_name, ingredients
      FROM scanHistory
      WHERE user_id = ?
      ORDER BY date DESC
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
  




// FUNCTION FOR CREATING ACCOUNT AND SETTING PASSWORD

const bcrypt = require('bcrypt');

app.post('/api/register', async (req, res) => {
  const { name, email, username, password } = req.body;

  if (!name || !email || !username || !password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    // Check if username or email already exists
    db.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: "Database error." });
      }

      if (results.length > 0) {
        return res.status(400).json({ success: false, message: "Username or email already exists." });
      }

      // Hash password
      // const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      db.query('INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)',
        [name, email, username, password],
        (err) => {
          if (err) {
            console.error('Insert error:', err);
            return res.status(500).json({ success: false, message: "Failed to create account." });
          }

          return res.json({ success: true, message: "Account created successfully!" });
        });
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, message: "Unexpected error." });
  }
});

  app.post('/loginnormal', (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password)
      return res.status(400).json({ success: false, message: 'Missing credentials' });
  
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });
  
      if (results.length === 0)
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
  
      const user = results[0];
  
      const match = (user.password===password);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }
  
      // Create a token
      // const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
  
      return res.json({ success: true,user});
    });
  });

app.post('/login/phone', (req, res) => {
    const { phone, password } = req.body;
  
    if (!phone || !password)
      return res.status(400).json({ success: false, message: 'Missing credentials' });
  
    db.query('SELECT * FROM users WHERE phone = ?', [phone], async (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });
  
      if (results.length === 0)
        return res.status(401).json({ success: false, message: 'Invalid phone or password' });

      const user = results[0];

      const match = (user.password===password);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }

      // Create a token
      // const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });

      return res.json({ success: true,user});
    });
  });


  app.post('/login/email', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Missing credentials' });

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });

      if (results.length === 0)
        return res.status(401).json({ success: false, message: 'Invalid email or password' });

      const user = results[0];

      const match = (user.password===password);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      // Create a token
      // const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
  
      return res.json({ success: true,user});
    });
  });



  

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})

