const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const onlineUsers = new Map();

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    onlineUsers.set(socket.id, { id: user.id, name: user.name, house: user.house_number });
    io.emit('online_users', Array.from(onlineUsers.values()));

    socket.on('send_message', async (data) => {
      try {
        const [result] = await pool.query(
          'INSERT INTO chat_messages (user_id, message) VALUES (?,?)',
          [user.id, data.message]
        );
        const msg = {
          id: result.insertId,
          user_id: user.id,
          user_name: user.name,
          house_number: user.house_number,
          message: data.message,
          created_at: new Date(),
        };
        io.emit('new_message', msg);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message.' });
      }
    });

    socket.on('typing', () => {
      socket.broadcast.emit('user_typing', { name: user.name, house: user.house_number });
    });

    socket.on('stop_typing', () => {
      socket.broadcast.emit('user_stop_typing', { name: user.name });
    });

    socket.on('delete_message', async ({ id }) => {
      try {
        const [rows] = await pool.query('SELECT user_id FROM chat_messages WHERE id = ?', [id]);
        if (rows.length && (rows[0].user_id === user.id || user.role === 'admin')) {
          await pool.query('UPDATE chat_messages SET is_deleted = TRUE WHERE id = ?', [id]);
          io.emit('message_deleted', { id });
        }
      } catch {}
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.id);
      io.emit('online_users', Array.from(onlineUsers.values()));
    });
  });
};
