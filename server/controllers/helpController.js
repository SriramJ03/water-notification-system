const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT hr.*, u.name AS requester_name, u.house_number AS requester_house,
        a.name AS accepted_by_name
       FROM help_requests hr
       JOIN users u ON hr.requester_id = u.id
       LEFT JOIN users a ON hr.accepted_by = a.id
       ORDER BY hr.created_at DESC`
    );
    res.json({ success: true, requests: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching help requests.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required.' });
    const [result] = await pool.query(
      'INSERT INTO help_requests (requester_id, title, description) VALUES (?,?,?)',
      [req.user.id, title, description]
    );
    const [rows] = await pool.query('SELECT * FROM help_requests WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, request: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating help request.' });
  }
};

exports.accept = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE help_requests SET status = 'accepted', accepted_by = ? WHERE id = ? AND status = 'open'",
      [req.user.id, id]
    );
    res.json({ success: true, message: 'Help request accepted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error accepting request.' });
  }
};

exports.getVolunteers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.*, u.name, u.house_number FROM volunteers v JOIN users u ON v.user_id = u.id WHERE v.is_active = TRUE`
    );
    res.json({ success: true, volunteers: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching volunteers.' });
  }
};

exports.registerVolunteer = async (req, res) => {
  try {
    const { description } = req.body;
    await pool.query(
      'INSERT INTO volunteers (user_id, description) VALUES (?,?) ON DUPLICATE KEY UPDATE description=VALUES(description), is_active=TRUE',
      [req.user.id, description]
    );
    res.json({ success: true, message: 'Registered as volunteer.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error registering volunteer.' });
  }
};
