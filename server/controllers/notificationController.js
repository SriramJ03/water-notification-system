const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT n.*, u.name AS sender_name, u.house_number AS sender_house,
        COALESCE(nr.is_read, FALSE) AS is_read
       FROM notifications n
       LEFT JOIN users u ON n.sent_by = u.id
       LEFT JOIN notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
       ORDER BY n.created_at DESC LIMIT 50`,
      [req.user.id]
    );
    res.json({ success: true, notifications: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching notifications.' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      `INSERT INTO notification_reads (notification_id, user_id, is_read, read_at)
       VALUES (?,?,TRUE,NOW()) ON DUPLICATE KEY UPDATE is_read=TRUE, read_at=NOW()`,
      [id, req.user.id]
    );
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error marking notification.' });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const [notifs] = await pool.query('SELECT id FROM notifications');
    for (const n of notifs) {
      await pool.query(
        `INSERT IGNORE INTO notification_reads (notification_id, user_id, is_read, read_at)
         VALUES (?,?,TRUE,NOW())`,
        [n.id, req.user.id]
      );
    }
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error marking all notifications.' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS count FROM notifications n
       WHERE n.id NOT IN (
         SELECT notification_id FROM notification_reads WHERE user_id = ? AND is_read = TRUE
       )`,
      [req.user.id]
    );
    res.json({ success: true, count: rows[0].count });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching unread count.' });
  }
};
