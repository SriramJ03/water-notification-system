const pool = require('../config/db');

exports.sendEmergency = async (req, res) => {
  const io = req.app.get('io');
  try {
    const { message } = req.body;
    const house = req.user.house_number;
    const alertMessage = message || `Emergency at House ${house}. Please help immediately.`;

    const [result] = await pool.query(
      'INSERT INTO emergency_alerts (house_number, message, sent_by) VALUES (?,?,?)',
      [house, alertMessage, req.user.id]
    );
    const [notif] = await pool.query(
      'INSERT INTO notifications (type, title, message, sent_by) VALUES (?,?,?,?)',
      ['emergency', `Emergency at House ${house}`, alertMessage, req.user.id]
    );
    const notification = {
      id: notif.insertId, type: 'emergency',
      title: `Emergency at House ${house}`,
      message: alertMessage,
      sent_by_name: req.user.name,
      house_number: house,
    };
    io.emit('emergency_alert', notification);
    io.emit('new_notification', notification);

    res.status(201).json({ success: true, message: 'Emergency alert sent to all neighbors.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error sending emergency alert.' });
  }
};

exports.getEmergencies = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ea.*, u.name AS sent_by_name FROM emergency_alerts ea
       LEFT JOIN users u ON ea.sent_by = u.id ORDER BY ea.created_at DESC LIMIT 20`
    );
    res.json({ success: true, emergencies: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching emergencies.' });
  }
};

exports.resolve = async (req, res) => {
  try {
    await pool.query('UPDATE emergency_alerts SET is_resolved = TRUE WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Emergency marked resolved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error resolving emergency.' });
  }
};
