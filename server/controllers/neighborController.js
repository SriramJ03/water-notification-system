const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `SELECT n.*, u.name AS registered_name FROM neighbors n
               LEFT JOIN users u ON n.neighbor_user_id = u.id WHERE n.user_id = ?`;
    const params = [req.user.id];
    if (search) {
      sql += ' AND (n.family_name LIKE ? OR n.house_number LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, neighbors: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching neighbors.' });
  }
};

exports.add = async (req, res) => {
  try {
    const { house_number, family_name, phone, members_count, address } = req.body;
    if (!house_number) return res.status(400).json({ success: false, message: 'House number required.' });
    const [linked] = await pool.query('SELECT id FROM users WHERE house_number = ?', [house_number]);
    const neighbor_user_id = linked.length > 0 ? linked[0].id : null;
    const [result] = await pool.query(
      'INSERT INTO neighbors (user_id, neighbor_user_id, house_number, family_name, phone, members_count, address) VALUES (?,?,?,?,?,?,?)',
      [req.user.id, neighbor_user_id, house_number, family_name, phone, members_count || 1, address]
    );
    const [rows] = await pool.query('SELECT * FROM neighbors WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, neighbor: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding neighbor.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { house_number, family_name, phone, members_count, address } = req.body;
    await pool.query(
      'UPDATE neighbors SET house_number=?, family_name=?, phone=?, members_count=?, address=? WHERE id=? AND user_id=?',
      [house_number, family_name, phone, members_count, address, id, req.user.id]
    );
    res.json({ success: true, message: 'Neighbor updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating neighbor.' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM neighbors WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ success: true, message: 'Neighbor removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error removing neighbor.' });
  }
};
