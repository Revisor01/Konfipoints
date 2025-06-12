// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

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

// Function to format date for German locale
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day}. ${month} ${year}`;
}

// Function to generate biblical password
function generateBiblicalPassword() {
  const book = BIBLE_BOOKS[Math.floor(Math.random() * BIBLE_BOOKS.length)];
  const chapter = Math.floor(Math.random() * 50) + 1; // 1-50
  const verse = Math.floor(Math.random() * 30) + 1; // 1-30
  return `${book}${chapter},${verse}`;
}

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// SQLite Database Setup
const dbPath = path.join(__dirname, 'data', 'konfi.db');
const dbExists = fs.existsSync(dbPath);

if (!dbExists) {
  console.log('📊 Creating new database...');
} else {
  console.log('📊 Using existing database...');
}

const db = new sqlite3.Database(dbPath);

// Initialize Database with correct schema
db.serialize(() => {
  // VERWENDE IF NOT EXISTS für alle CREATE TABLE statements
  
  // Admins table
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

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

  // Konfi Activities
  db.run(`CREATE TABLE IF NOT EXISTS konfi_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    konfi_id INTEGER,
    activity_id INTEGER,
    admin_id INTEGER,
    completed_date DATE DEFAULT CURRENT_DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (konfi_id) REFERENCES konfis (id),
    FOREIGN KEY (activity_id) REFERENCES activities (id),
    FOREIGN KEY (admin_id) REFERENCES admins (id)
  )`);

  // Bonus Points
  db.run(`CREATE TABLE IF NOT EXISTS bonus_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    konfi_id INTEGER,
    points INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('gottesdienst', 'gemeinde')),
    description TEXT NOT NULL,
    admin_id INTEGER,
    completed_date DATE DEFAULT CURRENT_DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (konfi_id) REFERENCES konfis (id),
    FOREIGN KEY (admin_id) REFERENCES admins (id)
  )`);

  // Settings table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  console.log('✅ Database schema ensured');

  // Nur bei neuer Datenbank Default-Daten einfügen
  if (!dbExists) {
    console.log('📝 Inserting default data...');
    
    // Insert default admin
    const adminPassword = bcrypt.hashSync('pastor2025', 10);
    db.run("INSERT INTO admins (username, display_name, password_hash) VALUES (?, ?, ?)", 
           ['admin', 'Pastor Administrator', adminPassword]);
    console.log('✅ Default admin created: username=admin, password=pastor2025');

    // Insert default settings
    db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ['target_gottesdienst', '10']);
    db.run("INSERT INTO settings (key, value) VALUES (?, ?)", ['target_gemeinde', '10']);
    console.log('✅ Default settings created');

    // Insert default jahrgänge
    const defaultJahrgaenge = ['2024/25', '2025/26', '2026/27'];
    defaultJahrgaenge.forEach(jahrgang => {
      db.run("INSERT INTO jahrgaenge (name) VALUES (?)", [jahrgang]);
    });
    console.log('✅ Default Jahrgänge created');

    // Insert default activities
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

    // Create some default konfis after jahrgaenge are created
    setTimeout(() => {
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
    }, 1000);
  } else {
    console.log('✅ Existing database loaded');
  }
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
    
    const token = jwt.sign({ id: admin.id, type: 'admin', display_name: admin.display_name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: admin.id, username: admin.username, display_name: admin.display_name, type: 'admin' } });
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

// === ADMIN MANAGEMENT ===

// Get all admins
app.get('/api/admins', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.all("SELECT id, username, display_name, created_at FROM admins ORDER BY created_at", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Add new admin
app.post('/api/admins', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { username, display_name, password } = req.body;
  
  if (!username || !display_name || !password) {
    return res.status(400).json({ error: 'Username, display name and password are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  
  db.run("INSERT INTO admins (username, display_name, password_hash) VALUES (?, ?, ?)",
         [username, display_name, hashedPassword],
         function(err) {
           if (err) {
             if (err.message.includes('UNIQUE constraint failed')) {
               return res.status(400).json({ error: 'Username already exists' });
             }
             return res.status(500).json({ error: 'Database error' });
           }
           
           res.json({ 
             id: this.lastID, 
             username, 
             display_name,
             created_at: new Date().toISOString()
           });
         });
});

// Update admin
app.put('/api/admins/:id', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const adminId = req.params.id;
  const { username, display_name, password } = req.body;
  
  if (!username || !display_name) {
    return res.status(400).json({ error: 'Username and display name are required' });
  }

  let query = "UPDATE admins SET username = ?, display_name = ?";
  let params = [username, display_name];
  
  if (password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    query += ", password_hash = ?";
    params.push(hashedPassword);
  }
  
  query += " WHERE id = ?";
  params.push(adminId);

  db.run(query, params, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    res.json({ message: 'Admin updated successfully' });
  });
});

// Delete admin
app.delete('/api/admins/:id', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const adminId = req.params.id;
  
  // Prevent deleting yourself
  if (parseInt(adminId) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  // Check if this is the last admin
  db.get("SELECT COUNT(*) as count FROM admins", [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (row.count <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin account' });
    }

    db.run("DELETE FROM admins WHERE id = ?", [adminId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      
      res.json({ message: 'Admin deleted successfully' });
    });
  });
});

// === JAHRGÄNGE MANAGEMENT ===

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

// Update jahrgang
app.put('/api/jahrgaenge/:id', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const jahrgangId = req.params.id;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.run("UPDATE jahrgaenge SET name = ? WHERE id = ?", [name, jahrgangId], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Jahrgang already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Jahrgang not found' });
    }
    
    res.json({ message: 'Jahrgang updated successfully' });
  });
});

// Delete jahrgang
app.delete('/api/jahrgaenge/:id', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const jahrgangId = req.params.id;

  // Check if jahrgang has konfis
  db.get("SELECT COUNT(*) as count FROM konfis WHERE jahrgang_id = ?", [jahrgangId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (row.count > 0) {
      return res.status(400).json({ error: 'Cannot delete jahrgang with existing konfis' });
    }

    db.run("DELETE FROM jahrgaenge WHERE id = ?", [jahrgangId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Jahrgang not found' });
      }
      
      res.json({ message: 'Jahrgang deleted successfully' });
    });
  });
});

// === KONFIS MANAGEMENT ===

// Get all konfis (admin only) - WITH ADMIN TRACKING
app.get('/api/konfis', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  // Get basic konfi info with jahrgang
  const konfisQuery = `
    SELECT k.*, j.name as jahrgang_name
    FROM konfis k
    JOIN jahrgaenge j ON k.jahrgang_id = j.id
    ORDER BY j.name DESC, k.name
  `;
  
  db.all(konfisQuery, [], (err, konfisRows) => {
    if (err) {
      console.error('Database error in /api/konfis:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    
    // Get all activities for all konfis
    const activitiesQuery = `
      SELECT ka.konfi_id, a.name, a.points, a.type, ka.completed_date as date, 
              COALESCE(adm.display_name, 'Unbekannt') as admin, ka.id
      FROM konfi_activities ka
      JOIN activities a ON ka.activity_id = a.id
      LEFT JOIN admins adm ON ka.admin_id = adm.id
      ORDER BY ka.completed_date DESC
    `;
    
    // Get all bonus points for all konfis
    const bonusQuery = `
      SELECT bp.konfi_id, bp.description, bp.points, bp.type, bp.completed_date as date,
              COALESCE(adm.display_name, 'Unbekannt') as admin, bp.id
      FROM bonus_points bp
      LEFT JOIN admins adm ON bp.admin_id = adm.id
      ORDER BY bp.completed_date DESC
    `;
    
    db.all(activitiesQuery, [], (err, allActivities) => {
      if (err) {
        console.error('Database error loading activities:', err);
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      
      db.all(bonusQuery, [], (err, allBonusPoints) => {
        if (err) {
          console.error('Database error loading bonus points:', err);
          return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        
        // Group activities and bonus points by konfi_id
        const activitiesByKonfi = {};
        const bonusPointsByKonfi = {};
        
        allActivities.forEach(activity => {
          if (!activitiesByKonfi[activity.konfi_id]) {
            activitiesByKonfi[activity.konfi_id] = [];
          }
          activitiesByKonfi[activity.konfi_id].push({
            name: activity.name,
            points: activity.points,
            type: activity.type,
            date: activity.date,
            admin: activity.admin,
            id: activity.id
          });
        });
        
        allBonusPoints.forEach(bonus => {
          if (!bonusPointsByKonfi[bonus.konfi_id]) {
            bonusPointsByKonfi[bonus.konfi_id] = [];
          }
          bonusPointsByKonfi[bonus.konfi_id].push({
            description: bonus.description,
            points: bonus.points,
            type: bonus.type,
            date: bonus.date,
            admin: bonus.admin,
            id: bonus.id
          });
        });
        
        // Build final result
        const konfis = konfisRows.map(row => ({
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
          activities: activitiesByKonfi[row.id] || [],
          bonusPoints: bonusPointsByKonfi[row.id] || []
        }));
        
        res.json(konfis);
      });
    });
  });
});

// Get single konfi (admin or konfi themselves) - WITH ADMIN TRACKING
// Get single konfi (admin or konfi themselves) - WITH ADMIN TRACKING
app.get('/api/konfis/:id', verifyToken, (req, res) => {
  const konfiId = parseInt(req.params.id, 10);
  
  // Validate konfiId
  if (isNaN(konfiId)) {
    return res.status(400).json({ error: 'Invalid konfi ID' });
  }
  
  if (req.user.type === 'konfi' && req.user.id !== konfiId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  console.log(`Loading konfi details for ID: ${konfiId}`);
  
  // Get basic konfi info
  const konfiQuery = `
    SELECT k.*, j.name as jahrgang_name
    FROM konfis k
    JOIN jahrgaenge j ON k.jahrgang_id = j.id
    WHERE k.id = ?
  `;
  
  db.get(konfiQuery, [konfiId], (err, konfiRow) => {
    if (err) {
      console.error('Database error in /api/konfis/:id:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    
    if (!konfiRow) {
      console.log(`Konfi with ID ${konfiId} not found`);
      return res.status(404).json({ error: 'Konfi not found' });
    }
    
    console.log(`Found konfi: ${konfiRow.name}`);
    
    // Get activities separately
    const activitiesQuery = `
      SELECT a.name, a.points, a.type, ka.completed_date as date, 
              COALESCE(adm.display_name, 'Unbekannt') as admin, ka.id
      FROM konfi_activities ka
      JOIN activities a ON ka.activity_id = a.id
      LEFT JOIN admins adm ON ka.admin_id = adm.id
      WHERE ka.konfi_id = ?
      ORDER BY ka.completed_date DESC
    `;
    
    // Get bonus points separately - FIXED: added bp. prefix to id
    const bonusQuery = `
      SELECT bp.description, bp.points, bp.type, bp.completed_date as date,
              COALESCE(adm.display_name, 'Unbekannt') as admin, bp.id
      FROM bonus_points bp
      LEFT JOIN admins adm ON bp.admin_id = adm.id
      WHERE bp.konfi_id = ?
      ORDER BY bp.completed_date DESC
    `;
    
    db.all(activitiesQuery, [konfiId], (err, activities) => {
      if (err) {
        console.error('Database error loading activities for konfi', konfiId, ':', err);
        return res.status(500).json({ error: 'Database error loading activities: ' + err.message });
      }
      
      console.log(`Found ${activities ? activities.length : 0} activities for konfi ${konfiId}`);
      
      db.all(bonusQuery, [konfiId], (err, bonusPoints) => {
        if (err) {
          console.error('Database error loading bonus points for konfi', konfiId, ':', err);
          return res.status(500).json({ error: 'Database error loading bonus points: ' + err.message });
        }
        
        console.log(`Found ${bonusPoints ? bonusPoints.length : 0} bonus points for konfi ${konfiId}`);
        
        const konfi = {
          id: konfiRow.id,
          name: konfiRow.name,
          username: konfiRow.username,
          password: konfiRow.password_plain,
          jahrgang: konfiRow.jahrgang_name,
          jahrgang_id: konfiRow.jahrgang_id,
          points: {
            gottesdienst: konfiRow.gottesdienst_points || 0,
            gemeinde: konfiRow.gemeinde_points || 0
          },
          activities: activities || [],
          bonusPoints: bonusPoints || []
        };
        
        console.log(`Sending konfi data:`, JSON.stringify(konfi, null, 2));
        res.json(konfi);
      });
    });
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

// Update konfi
app.put('/api/konfis/:id', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const konfiId = req.params.id;
  const { name, jahrgang_id } = req.body;
  
  if (!name || !jahrgang_id) {
    return res.status(400).json({ error: 'Name and Jahrgang are required' });
  }

  // Generate new username based on name
  const username = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');

  db.run("UPDATE konfis SET name = ?, jahrgang_id = ?, username = ? WHERE id = ?", 
         [name, jahrgang_id, username, konfiId], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Konfi not found' });
    }
    
    res.json({ message: 'Konfi updated successfully' });
  });
});

// Delete konfi
app.delete('/api/konfis/:id', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const konfiId = req.params.id;

  // Delete related records first
  db.serialize(() => {
    db.run("DELETE FROM konfi_activities WHERE konfi_id = ?", [konfiId]);
    db.run("DELETE FROM bonus_points WHERE konfi_id = ?", [konfiId]);
    db.run("DELETE FROM konfis WHERE id = ?", [konfiId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Konfi not found' });
      }
      
      res.json({ message: 'Konfi deleted successfully' });
    });
  });
});

// === ACTIVITIES MANAGEMENT ===

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

// Update activity
app.put('/api/activities/:id', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const activityId = req.params.id;
  const { name, points, type } = req.body;
  
  if (!name || !points || !type) {
    return res.status(400).json({ error: 'Name, points and type are required' });
  }

  if (!['gottesdienst', 'gemeinde'].includes(type)) {
    return res.status(400).json({ error: 'Type must be gottesdienst or gemeinde' });
  }

  db.run("UPDATE activities SET name = ?, points = ?, type = ? WHERE id = ?", 
         [name, points, type, activityId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json({ message: 'Activity updated successfully' });
  });
});

// Delete activity
app.delete('/api/activities/:id', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const activityId = req.params.id;

  // Check if activity is used
  db.get("SELECT COUNT(*) as count FROM konfi_activities WHERE activity_id = ?", [activityId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (row.count > 0) {
      return res.status(400).json({ error: 'Cannot delete activity that has been assigned to konfis' });
    }

    db.run("DELETE FROM activities WHERE id = ?", [activityId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Activity not found' });
      }
      
      res.json({ message: 'Activity deleted successfully' });
    });
  });
});

// Assign activity to konfi (admin only) - WITH ADMIN TRACKING
// Assign activity to konfi (admin only) - WITH ADMIN TRACKING AND DATE
app.post('/api/konfis/:id/activities', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const konfiId = req.params.id;
  const { activityId, completed_date } = req.body;
  
  if (!activityId) {
    return res.status(400).json({ error: 'Activity ID is required' });
  }
  
  const date = completed_date || new Date().toISOString().split('T')[0];
  
  // Get activity details
  db.get("SELECT * FROM activities WHERE id = ?", [activityId], (err, activity) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    // Add activity to konfi WITH ADMIN TRACKING AND DATE
    db.run("INSERT INTO konfi_activities (konfi_id, activity_id, admin_id, completed_date) VALUES (?, ?, ?, ?)",
      [konfiId, activityId, req.user.id, date],
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
                date: formatDate(date),
                admin: req.user.display_name
              }
            });
          });
      });
  });
});

// Add bonus points - WITH ADMIN TRACKING
// Add bonus points - WITH ADMIN TRACKING AND DATE
app.post('/api/konfis/:id/bonus-points', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const konfiId = req.params.id;
  const { points, type, description, completed_date } = req.body;
  
  if (!points || !type || !description) {
    return res.status(400).json({ error: 'Points, type and description are required' });
  }
  
  if (!['gottesdienst', 'gemeinde'].includes(type)) {
    return res.status(400).json({ error: 'Type must be gottesdienst or gemeinde' });
  }
  
  const date = completed_date || new Date().toISOString().split('T')[0];
  
  // Add bonus points WITH ADMIN TRACKING AND DATE
  db.run("INSERT INTO bonus_points (konfi_id, points, type, description, admin_id, completed_date) VALUES (?, ?, ?, ?, ?, ?)",
    [konfiId, points, type, description, req.user.id, date],
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
              date: formatDate(date),
              admin: req.user.display_name
            }
          });
        });
    });
});

// Remove activity from konfi (admin only)
app.delete('/api/konfis/:id/activities/:recordId', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  const konfiId = req.params.id;
  const recordId = req.params.recordId; // Dies ist die konfi_activities.id
  
  // Get activity details first to subtract points
  db.get("SELECT ka.id, ka.activity_id, a.points, a.type FROM konfi_activities ka JOIN activities a ON ka.activity_id = a.id WHERE ka.id = ? AND ka.konfi_id = ?", 
    [recordId, konfiId], (err, activityAssignment) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!activityAssignment) {
        return res.status(404).json({ error: 'Activity assignment not found' });
      }
      
      // Remove the assignment
      db.run("DELETE FROM konfi_activities WHERE id = ?", [recordId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Update konfi points (subtract)
        const pointField = activityAssignment.type === 'gottesdienst' ? 'gottesdienst_points' : 'gemeinde_points';
        db.run(`UPDATE konfis SET ${pointField} = ${pointField} - ? WHERE id = ?`,
          [activityAssignment.points, konfiId],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Database error updating points' });
            }
            
            res.json({ 
              message: 'Activity removed successfully',
              pointsSubtracted: activityAssignment.points,
              type: activityAssignment.type
            });
          });
      });
    });
});

// Remove bonus points from konfi (admin only)
app.delete('/api/konfis/:id/bonus-points/:bonusId', verifyToken, (req, res) => {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const konfiId = req.params.id;
  const bonusId = req.params.bonusId;

  // Get bonus points details first to subtract points
  db.get("SELECT * FROM bonus_points WHERE id = ? AND konfi_id = ?", [bonusId, konfiId], (err, bonusPoint) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!bonusPoint) {
      return res.status(404).json({ error: 'Bonus points not found' });
    }

    // Remove the bonus points
    db.run("DELETE FROM bonus_points WHERE id = ?", [bonusId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Update konfi points (subtract)
      const pointField = bonusPoint.type === 'gottesdienst' ? 'gottesdienst_points' : 'gemeinde_points';
      db.run(`UPDATE konfis SET ${pointField} = ${pointField} - ? WHERE id = ?`,
             [bonusPoint.points, konfiId],
             (err) => {
               if (err) {
                 return res.status(500).json({ error: 'Database error updating points' });
               }
               
               res.json({ 
                 message: 'Bonus points removed successfully',
                 pointsSubtracted: bonusPoint.points,
                 type: bonusPoint.type
               });
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