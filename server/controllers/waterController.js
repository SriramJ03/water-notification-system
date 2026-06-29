const pool = require('../config/db');

exports.getStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ws.*, u.name AS updated_by_name, u.house_number AS updated_by_house
       FROM water_status ws
       LEFT JOIN users u ON ws.updated_by = u.id
       ORDER BY ws.id DESC LIMIT 1`
    );
    res.json({ success: true, status: rows[0] || { status: 'unavailable' } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching water status.' });
  }
};

exports.updateStatus = async (req, res) => {
  const io = req.app.get('io');
  try {
    const { status } = req.body;
    if (!['available', 'unavailable'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    await pool.query('UPDATE water_status SET status = ?, updated_by = ? WHERE id = 1', [status, req.user.id]);

    const [rows] = await pool.query(
      `SELECT ws.*, u.name AS updated_by_name, u.house_number AS updated_by_house
       FROM water_status ws LEFT JOIN users u ON ws.updated_by = u.id WHERE ws.id = 1`
    );

    const now = new Date();
    const type = status === 'available' ? 'water_start' : 'water_stop';
    const title = status === 'available' ? 'Water has started' : 'Water supply stopped';
    const message = `${title} — updated by ${req.user.name} (House ${req.user.house_number})`;

    const [notif] = await pool.query(
      'INSERT INTO notifications (type, title, message, sent_by) VALUES (?,?,?,?)',
      [type, title, message, req.user.id]
    );

    if (status === 'available') {
      await pool.query(
        'INSERT INTO water_history (date, start_time, started_by) VALUES (CURDATE(), NOW(), ?)',
        [req.user.id]
      );
    } else {
      await pool.query(
        `UPDATE water_history SET stop_time = NOW(), stopped_by = ?,
         duration_minutes = TIMESTAMPDIFF(MINUTE, start_time, NOW())
         WHERE date = CURDATE() AND stop_time IS NULL ORDER BY id DESC LIMIT 1`,
        [req.user.id]
      );
    }

    const notification = {
      id: notif.insertId,
      type,
      title,
      message,
      sent_by_name: req.user.name,
      house_number: req.user.house_number,
      created_at: now,
    };

    io.emit('water_status_update', { status: rows[0], notification });
    io.emit('new_notification', notification);

    res.json({ success: true, message: `Water status updated to ${status}.`, status: rows[0] });
  } catch (err) {
    console.error('Update water error:', err);
    res.status(500).json({ success: false, message: 'Error updating water status.' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const { search, limit = 20, offset = 0 } = req.query;
    let sql = `
      SELECT wh.*, 
        s.name AS started_by_name, s.house_number AS started_by_house,
        e.name AS stopped_by_name, e.house_number AS stopped_by_house
      FROM water_history wh
      LEFT JOIN users s ON wh.started_by = s.id
      LEFT JOIN users e ON wh.stopped_by = e.id
    `;
    const params = [];
    if (search) {
      sql += ' WHERE DATE_FORMAT(wh.date, "%d %b") LIKE ? OR s.name LIKE ? OR e.name LIKE ?';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY wh.date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, history: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching water history.' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [totalHouses] = await pool.query('SELECT COUNT(*) AS count FROM houses');
    const [totalUsers] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE is_active = TRUE');
    const [todayAlerts] = await pool.query(
      "SELECT COUNT(*) AS count FROM notifications WHERE DATE(created_at) = CURDATE()"
    );
    const [weeklyHistory] = await pool.query(
      `SELECT DAYNAME(date) AS day, duration_minutes
       FROM water_history
       WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       ORDER BY date ASC`
    );
    res.json({
      success: true,
      stats: {
        total_houses: totalHouses[0].count,
        total_users: totalUsers[0].count,
        today_alerts: todayAlerts[0].count,
        weekly_history: weeklyHistory,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching stats.' });
  }
};
