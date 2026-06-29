const pool = require('../config/db');

exports.getMessages = async (req, res) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;
    let sql = `
      SELECT cm.*, u.name AS user_name, u.house_number, u.profile_picture
      FROM chat_messages cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.is_deleted = FALSE
    `;
    const params = [];
    if (search) {
      sql += ' AND cm.message LIKE ?';
      params.push(`%${search}%`);
    }
    sql += ' ORDER BY cm.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, messages: rows.reverse() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching messages.' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT user_id FROM chat_messages WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Message not found.' });
    if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete this message.' });
    }
    await pool.query('UPDATE chat_messages SET is_deleted = TRUE WHERE id = ?', [id]);
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting message.' });
  }
};
