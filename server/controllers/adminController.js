const pool = require('../config/db');

exports.getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, mobile, house_number, family_name, members_count, role, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ success: true, users: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users.' });
  }
};

exports.toggleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, id]);
    res.json({ success: true, message: `User ${is_active ? 'enabled' : 'disabled'}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating user status.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ? AND role != "admin"', [req.params.id]);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error deleting user.' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [[{ users }]] = await pool.query('SELECT COUNT(*) AS users FROM users WHERE is_active = TRUE');
    const [[{ houses }]] = await pool.query('SELECT COUNT(*) AS houses FROM houses');
    const [[{ alerts_today }]] = await pool.query("SELECT COUNT(*) AS alerts_today FROM notifications WHERE DATE(created_at) = CURDATE()");
    const [[{ emergencies }]] = await pool.query('SELECT COUNT(*) AS emergencies FROM emergency_alerts WHERE is_resolved = FALSE');
    const [recent_history] = await pool.query(
      `SELECT wh.date, wh.start_time, wh.stop_time, wh.duration_minutes,
        s.name AS started_by, e.name AS stopped_by
       FROM water_history wh
       LEFT JOIN users s ON wh.started_by = s.id
       LEFT JOIN users e ON wh.stopped_by = e.id
       ORDER BY wh.date DESC LIMIT 7`
    );
    res.json({ success: true, stats: { users, houses, alerts_today, emergencies, recent_history } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching admin stats.' });
  }
};
