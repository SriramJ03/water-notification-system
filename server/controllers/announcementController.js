const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, u.name AS posted_by_name FROM announcements a
       LEFT JOIN users u ON a.posted_by = u.id ORDER BY a.created_at DESC`
    );
    res.json({ success: true, announcements: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching announcements.' });
  }
};

exports.create = async (req, res) => {
  const io = req.app.get('io');
  try {
    const { title, body, tag } = req.body;
    if (!title || !body) return res.status(400).json({ success: false, message: 'Title and body required.' });
    const [result] = await pool.query(
      'INSERT INTO announcements (title, body, tag, posted_by) VALUES (?,?,?,?)',
      [title, body, tag || 'general', req.user.id]
    );
    const [notif] = await pool.query(
      'INSERT INTO notifications (type, title, message, sent_by) VALUES (?,?,?,?)',
      ['announcement', title, body, req.user.id]
    );
    io.emit('new_notification', { id: notif.insertId, type: 'announcement', title, message: body, sent_by_name: req.user.name });
    const [rows] = await pool.query('SELECT * FROM announcements WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, announcement: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating announcement.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting announcement.' });
  }
};
