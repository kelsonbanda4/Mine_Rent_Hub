const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const db = require('./db');


dotenv.config();

const authRoutes = require('./routes/authRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const customerRoutes = require('./routes/customerRoutes');
const authenticateToken = require('./middlewares/authMiddleware');


const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/customer', customerRoutes);

app.get('/get-equipment', (req, res) => {
  db.query('SELECT * FROM equipment', (err, results) => {
    if (err) return res.status(500).send('Failed to load listings');
    res.json(results);
  });
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // serve images
app.use(express.static('public'));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Upload route
app.post('/upload-equipment', authenticateToken, upload.single('image'), (req, res) => {
  const { id: vendor_id, role } = req.user;
  if (role !== 'vendor') return res.status(403).send('Only vendors can upload equipment.');

  const { name, type, price, description } = req.body;
  if (!req.file) return res.status(400).send('Image is required');

  const image = req.file.filename;

  const sql = `
    INSERT INTO equipment (vendor_id, name, type, price, description, image)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [vendor_id, name, type, price, description, image];

  db.query(sql, values, (err) => {
    if (err) {
      console.error('SQL error:', err);
      return res.status(500).send('Database error');
    }
    res.send('Equipment uploaded successfully!');
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});