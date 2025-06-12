// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'konfi-secret-2025';

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8624',
    'https://konfipoints.godsapp.de',
    'http://127.0.0.1:8624'
  ],
  credentials: true
}));
app.use(express.json());

// Bible books for password generation
const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Levitikus', 'Numeri', 'Deuteronomium',
  'Josua', 'Richter', 'Ruth', 'Samuel', 'Koenige', 'Chronik',
  'Esra', 'Nehemia', 'Ester', 'Hiob', 'Psalmen', 'Sprueche',
  'Prediger', 'Hohelied', 'Jesaja', 'Jeremia', 'Klagelieder',
  'Hesekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadja',
  'Jona', 'Micha', 'Nahum', 'Habakuk', 'Zephanja', 'Haggai',
  'Sacharja', 'Maleachi', 'Matthaeus', 'Markus', 'Lukas',
  'Johannes', 'Apostelgeschichte', 'Roemer', 'Korinther',
  'Galater', 'Epheser', 'Philipper', 'Kolosser', 'Thessalonicher',
  'Timotheus', 'Titus', 'Philemon', 'Hebraeer', 'Jakobus',
  'Petrus', 'Johannes', 'Judas', 'Offenbarung'
];

// Function to generate biblical password
function generateBiblicalPassword() {
  const book = BIBLE_BOOKS[Math.floor(Math.random() * BIBLE_BOOKS.length)];
  const chapter = Math.floor(Math.random() * 50) + 1; // 1-50
  const verse = Math.floor(Math.random() * 30) + 1; // 1-30
  return `${book}${chapter},${verse}`;
}

// SQLite Database Setup
const dbPath = path.join(__dirname, 'data', 'konfi.db');
const db = new sqlite3.Database(dbPath);

// Initialize Database
db.serialize(() => {
  // Jahrgänge table
  db.run(`CREATE TABLE IF NOT EXISTS jahrgaenge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Konfis table
  db.run(`CREATE TABLE IF NOT EXISTS konfis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    jahrgang_id INTEGER,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_plain TEXT NOT NULL,
    gottesdienst_points INTEGER DEFAULT 0,
    gemeinde_points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (jahrgang_id) REFERENCES jahrgaenge (id)
  )`);

  // Activities table
  db.run(`CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    points INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('gottesdienst', 'gemeinde')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Konfi Activities (tracking which konfi did which activity)
  db.run(`CREATE TABLE IF NOT EXISTS konfi_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    konfi_id INTEGER,
    activity_id INTEGER,
    completed_date DATE DEFAULT CURRENT_DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (konfi_id) REFERENCES konfis (id),
    FOREIGN KEY (activity_id) REFERENCES activities (id)
  )`);

  // NEUE TABELLE: Zusatzpunkte mit freiem Text
  db.run(`CREATE TABLE IF NOT EXISTS bonus_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    konfi_id INTEGER,
    points INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('gottesdienst', 'gemeinde')),
    description TEXT NOT NULL,
    completed_date DATE DEFAULT CURRENT_DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (konfi_id) REFERENCES konfis (id)
  )`);

  // Settings table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  // Admins table
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default data if tables are empty
  db.get("SELECT COUNT(*) as count FROM admins", (err, row) => {
    if (row.count === 0) {
      const adminPassword = bcrypt.hashSync('pastor2025', 10);
      db.run("INSERT INTO admins (username, password_hash) VALUES (?, ?)", ['admin', adminPassword]);
      console.log('✅ Default admin created: username=admin, password=pastor2025');
    }
  });

  db.get("SELECT COUNT(*) as count FROM settings", (err, row) => {
    if (row.count === 0) {
      db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ['target_gottesdienst', '10']);
      db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ['target_gemeinde', '10']);
      console.log('✅ Default settings created');
    }
  });

  db.get("SELECT COUNT(*) as count FROM jahrgaenge", (err, row) => {
    if (row.count === 0) {
      const defaultJahrgaenge = ['2024/25', '2025/26', '2026/27'];
      defaultJahrgaenge.forEach(jahrgang => {
        db.run("INSERT INTO jahrgaenge (name) VALUES (?)", [jahrgang]);
      });
      console.log('✅ Default Jahrgänge created');
    }
  });

  db.get("SELECT COUNT(*) as count FROM activities", (err, row) => {
    if (row.count === 0) {
      const defaultActivities = [
        ['Sonntagsgottesdienst', 2, 'gottesdienst'],
        ['Kindergottesdienst helfen', 3, 'gemeinde'],
        ['Jugendgottesdienst', 3, 'gottesdienst'],
        ['Gemeindefest helfen', 4, 'gemeinde'],
        ['Konfistunde', 1, 'gottesdienst'],
        ['Besuchsdienst', 5, 'gemeinde'],
        ['Friedhofspflege', 3, 'gemeinde'],
        ['Taizé-Gottesdienst', 2, 'gottesdienst'],
        ['Weihnachtsfeier helfen', 4, 'gemeinde'],
        ['Ostergottesdienst', 2, 'gottesdienst']
      ];
      
      defaultActivities.forEach(([name, points, type]) => {
        db.run("INSERT INTO activities (name, points, type) VALUES (?, ?, ?)", [name, points, type]);
      });
      console.log('✅ Default activities created');
    }
  });

  // Create some default konfis after jahrgaenge are created
  setTimeout(() => {
    db.get("SELECT COUNT(*) as count FROM konfis", (err, row) => {
      if (row.count === 0) {
        const defaultKonfis = [
          ['Anna Mueller', '2025/26'],
          ['Max Schmidt', '2025/26'],
          ['Lisa Weber', '2024/25'],
          ['Tom Hansen', '2025/26'],
          ['Sarah Klein', '2024/25']
        ];
        
        defaultKonfis.forEach(([name, jahrgang]) => {
          // Get jahrgang ID
          db.get("SELECT id FROM jahrgaenge WHERE name = ?", [jahrgang], (err, jahrgangRow) => {
            if (jahrgangRow) {
              const password = generateBiblicalPassword();
              const hashedPassword = bcrypt.hashSync(password, 10);
              const username = name.toLowerCase().replace(' ', '.');
              
              db.run("INSERT INTO konfis (name, jahrgang_id, username, password_hash, password_plain) VALUES (?, ?, ?, ?, ?)", 
                     [name, jahrgangRow.id, username, hashedPassword, password], function(err) {
                if (!err) {
                  console.log(`✅ Konfi created: ${name} - Username: ${username} - Password: ${password}`);
                }
              });
            }
          });
        });
      }
    });
  }, 1000);
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Konfi Points API is running' });
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get("SELECT * FROM admins WHERE username = ?", [username], (err, admin) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: admin.id, type: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: admin.id, username: admin.username, type: 'admin' } });
  });
});

// Konfi login
app.post('/api/konfi/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get("SELECT k.*, j.name as jahrgang_name FROM konfis k JOIN jahrgaenge j ON k.jahrgang_id = j.id WHERE k.username = ?", [username], (err, konfi) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!konfi || !bcrypt.compareSync(password, konfi.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: konfi.id, type: 'konfi' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ 
      token, 
      user: { 
        id: konfi.id, 
        name: konfi.name, 
        username: konfi.username,
        jahrgang: konfi.jahrgang_name,
        type: 'konfi' 
      } 
    });
  });
});

// Get all jahrgänge
app.get('/api/jahrgaenge', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.all("SELECT * FROM jahrgaenge ORDER BY name DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Add new jahrgang
app.post('/api/jahrgaenge', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.run("INSERT INTO jahrgaenge (name) VALUES (?)", [name], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Jahrgang already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ id: this.lastID, name });
  });
});

// Get all konfis (admin only) - ERWEITERT für Zusatzpunkte
app.get('/api/konfis', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const query = `
    SELECT k.*, j.name as jahrgang_name,
           COUNT(DISTINCT ka.id) as total_activities,
           COUNT(DISTINCT bp.id) as total_bonus,
           GROUP_CONCAT(DISTINCT a.name || '|' || ka.completed_date || '|' || a.points || '|' || a.type) as activities_list,
           GROUP_CONCAT(DISTINCT bp.description || '|' || bp.completed_date || '|' || bp.points || '|' || bp.type, '###') as bonus_list
    FROM konfis k
    JOIN jahrgaenge j ON k.jahrgang_id = j.id
    LEFT JOIN konfi_activities ka ON k.id = ka.konfi_id
    LEFT JOIN activities a ON ka.activity_id = a.id
    LEFT JOIN bonus_points bp ON k.id = bp.konfi_id
    GROUP BY k.id
    ORDER BY j.name DESC, k.name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const konfis = rows.map(row => ({
      id: row.id,
      name: row.name,
      username: row.username,
      password: row.password_plain,
      jahrgang: row.jahrgang_name,
      jahrgang_id: row.jahrgang_id,
      points: {
        gottesdienst: row.gottesdienst_points,
        gemeinde: row.gemeinde_points
      },
      activities: row.activities_list ? 
        row.activities_list.split(',').map(item => {
          const [name, date, points, type] = item.split('|');
          return { name, date, points: parseInt(points), type };
        }) : [],
      bonusPoints: row.bonus_list && row.bonus_list !== '' ?
        row.bonus_list.split('###').map(item => {
          const [description, date, points, type] = item.split('|');
          return { description, date, points: parseInt(points), type };
        }) : []
    }));
    
    res.json(konfis);
  });
});

// Get single konfi (admin or konfi themselves) - ERWEITERT für Zusatzpunkte
app.get('/api/konfis/:id', verifyToken, (req, res) => {
  const konfiId = req.params.id;
  
  if (req.user.type === 'konfi' && req.user.id !== parseInt(konfiId)) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const query = `
    SELECT k.*, j.name as jahrgang_name,
           GROUP_CONCAT(DISTINCT a.name || '|' || a.points || '|' || a.type || '|' || ka.completed_date) as activities_list,
           GROUP_CONCAT(DISTINCT bp.description || '|' || bp.points || '|' || bp.type || '|' || bp.completed_date, '###') as bonus_list
    FROM konfis k
    JOIN jahrgaenge j ON k.jahrgang_id = j.id
    LEFT JOIN konfi_activities ka ON k.id = ka.konfi_id
    LEFT JOIN activities a ON ka.activity_id = a.id
    LEFT JOIN bonus_points bp ON k.id = bp.konfi_id
    WHERE k.id = ?
    GROUP BY k.id
  `;
  
  db.get(query, [konfiId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Konfi not found' });
    }
    
    const konfi = {
      id: row.id,
      name: row.name,
      username: row.username,
      password: row.password_plain,
      jahrgang: row.jahrgang_name,
      jahrgang_id: row.jahrgang_id,
      points: {
        gottesdienst: row.gottesdienst_points,
        gemeinde: row.gemeinde_points
      },
      activities: row.activities_list ? 
        row.activities_list.split(',').map(item => {
          const [name, points, type, date] = item.split('|');
          return { name, points: parseInt(points), type, date };
        }) : [],
      bonusPoints: row.bonus_list && row.bonus_list !== '' ?
        row.bonus_list.split('###').map(item => {
          const [description, points, type, date] = item.split('|');
          return { description, points: parseInt(points), type, date };
        }) : []
    };
    
    res.json(konfi);
  });
});

// Add new konfi (admin only)
app.post('/api/konfis', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { name, jahrgang_id } = req.body;
  
  if (!name || !jahrgang_id) {
    return res.status(400).json({ error: 'Name and Jahrgang are required' });
  }

  // Generate password and username
  const password = generateBiblicalPassword();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const username = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
  
  db.run("INSERT INTO konfis (name, jahrgang_id, username, password_hash, password_plain) VALUES (?, ?, ?, ?, ?)",
         [name, jahrgang_id, username, hashedPassword, password],
         function(err) {
           if (err) {
             if (err.message.includes('UNIQUE constraint failed')) {
               return res.status(400).json({ error: 'Username already exists' });
             }
             return res.status(500).json({ error: 'Database error' });
           }
           
           // Get jahrgang name
           db.get("SELECT name FROM jahrgaenge WHERE id = ?", [jahrgang_id], (err, jahrgangRow) => {
             res.json({ 
               id: this.lastID, 
               name, 
               username,
               password,
               jahrgang: jahrgangRow ? jahrgangRow.name : '',
               jahrgang_id,
               points: { gottesdienst: 0, gemeinde: 0 },
               activities: [],
               bonusPoints: []
             });
           });
         });
});

// Get all activities
app.get('/api/activities', verifyToken, (req, res) => {
  db.all("SELECT * FROM activities ORDER BY type, name", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Add new activity (admin only)
app.post('/api/activities', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { name, points, type } = req.body;
  
  if (!name || !points || !type) {
    return res.status(400).json({ error: 'Name, points and type are required' });
  }

  if (!['gottesdienst', 'gemeinde'].includes(type)) {
    return res.status(400).json({ error: 'Type must be gottesdienst or gemeinde' });
  }

  db.run("INSERT INTO activities (name, points, type) VALUES (?, ?, ?)",
         [name, points, type],
         function(err) {
           if (err) {
             return res.status(500).json({ error: 'Database error' });
           }
           
           res.json({ 
             id: this.lastID, 
             name, 
             points,
             type
           });
         });
});

// Assign activity to konfi (admin only)
app.post('/api/konfis/:id/activities', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const konfiId = req.params.id;
  const { activityId } = req.body;
  
  if (!activityId) {
    return res.status(400).json({ error: 'Activity ID is required' });
  }

  // Get activity details
  db.get("SELECT * FROM activities WHERE id = ?", [activityId], (err, activity) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Add activity to konfi
    db.run("INSERT INTO konfi_activities (konfi_id, activity_id) VALUES (?, ?)",
           [konfiId, activityId],
           function(err) {
             if (err) {
               return res.status(500).json({ error: 'Database error' });
             }

             // Update konfi points
             const pointField = activity.type === 'gottesdienst' ? 'gottesdienst_points' : 'gemeinde_points';
             db.run(`UPDATE konfis SET ${pointField} = ${pointField} + ? WHERE id = ?`,
                    [activity.points, konfiId],
                    (err) => {
                      if (err) {
                        return res.status(500).json({ error: 'Database error updating points' });
                      }
                      
                      res.json({ 
                        message: 'Activity assigned successfully',
                        activity: {
                          name: activity.name,
                          points: activity.points,
                          type: activity.type,
                          date: new Date().toLocaleDateString('de-DE')
                        }
                      });
                    });
           });
  });
});

// NEUE ROUTE: Zusatzpunkte hinzufügen
app.post('/api/konfis/:id/bonus-points', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const konfiId = req.params.id;
  const { points, type, description } = req.body;
  
  if (!points || !type || !description) {
    return res.status(400).json({ error: 'Points, type and description are required' });
  }

  if (!['gottesdienst', 'gemeinde'].includes(type)) {
    return res.status(400).json({ error: 'Type must be gottesdienst or gemeinde' });
  }

  // Add bonus points
  db.run("INSERT INTO bonus_points (konfi_id, points, type, description) VALUES (?, ?, ?, ?)",
         [konfiId, points, type, description],
         function(err) {
           if (err) {
             return res.status(500).json({ error: 'Database error' });
           }

           // Update konfi points
           const pointField = type === 'gottesdienst' ? 'gottesdienst_points' : 'gemeinde_points';
           db.run(`UPDATE konfis SET ${pointField} = ${pointField} + ? WHERE id = ?`,
                  [points, konfiId],
                  (err) => {
                    if (err) {
                      return res.status(500).json({ error: 'Database error updating points' });
                    }
                    
                    res.json({ 
                      message: 'Bonus points assigned successfully',
                      bonusPoint: {
                        description,
                        points,
                        type,
                        date: new Date().toLocaleDateString('de-DE')
                      }
                    });
                  });
         });
});

// Get settings
app.get('/api/settings', verifyToken, (req, res) => {
  db.all("SELECT * FROM settings", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    res.json(settings);
  });
});

// Update settings (admin only)
app.put('/api/settings', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { target_gottesdienst, target_gemeinde } = req.body;
  
  if (target_gottesdienst) {
    db.run("UPDATE settings SET value = ? WHERE key = 'target_gottesdienst'", [target_gottesdienst]);
  }
  
  if (target_gemeinde) {
    db.run("UPDATE settings SET value = ? WHERE key = 'target_gemeinde'", [target_gemeinde]);
  }
  
  res.json({ message: 'Settings updated successfully' });
});

// Generate new password for konfi (admin only)
app.post('/api/konfis/:id/regenerate-password', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const konfiId = req.params.id;
  const newPassword = generateBiblicalPassword();
  const hashedPassword = bcrypt.hashSync(newPassword, 10);

  db.run("UPDATE konfis SET password_hash = ?, password_plain = ? WHERE id = ?",
         [hashedPassword, newPassword, konfiId],
         function(err) {
           if (err) {
             return res.status(500).json({ error: 'Database error' });
           }
           
           if (this.changes === 0) {
             return res.status(404).json({ error: 'Konfi not found' });
           }
           
           res.json({ 
             message: 'Password regenerated successfully',
             password: newPassword
           });
         });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Create data directory if it doesn't exist
const fs = require('fs');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Konfi Points API running on port ${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
  console.log(`🔐 Admin login: username=admin, password=pastor2025`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('📝 Database connection closed.');
    }
    process.exit(0);
  });
});