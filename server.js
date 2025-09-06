const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const app = express();
const db = new sqlite3.Database('./database.db');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Buat tabel user & anggota jika belum ada
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS anggota (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT, lastName TEXT, company TEXT, mobilePhone TEXT, email TEXT, website TEXT,
    street TEXT, city TEXT, postalCode TEXT, industry TEXT, annualRevenue TEXT,
    noNIBSIUP TEXT, npwpUsaha TEXT, numberOfEmployees TEXT, nearestDPD TEXT
  )`);
});

// Register user
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash], function(err) {
    if (err) return res.status(400).send('Email sudah terdaftar');
    res.send('Registrasi berhasil');
  });
});

// Login user
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (!user) return res.status(401).send('Email tidak ditemukan');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).send('Password salah');
    res.send('Login berhasil');
  });
});

// Simpan data anggota
app.post('/daftar-anggota', (req, res) => {
  const data = req.body;
  db.run(`INSERT INTO anggota (
    firstName, lastName, company, mobilePhone, email, website,
    street, city, postalCode, industry, annualRevenue,
    noNIBSIUP, npwpUsaha, numberOfEmployees, nearestDPD
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.firstName, data.lastName, data.company, data.mobilePhone, data.email, data.website,
      data.street, data.city, data.postalCode, data.industry, data.annualRevenue,
      data.noNIBSIUP, data.npwpUsaha, data.numberOfEmployees, data.nearestDPD
    ],
    function(err) {
      if (err) return res.status(500).send('Gagal simpan data');
      res.send('Data anggota berhasil disimpan');
    }
  );
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));