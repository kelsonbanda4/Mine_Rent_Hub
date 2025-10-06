const express = require('express');
const db = require('../db');
const router = express.Router();

// Get equipment for a specific vendor
router.get('/my-equipment/:vendor_id', (req, res) => {
  const vendorId = req.params.vendor_id;

  const sql = 'SELECT * FROM equipment WHERE vendor_id = ? ORDER BY id DESC';
  db.query(sql, [vendorId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

// Get vendor info by token (you can secure it using JWT)
router.get('/me/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result[0]);
  });
});



module.exports = router;
