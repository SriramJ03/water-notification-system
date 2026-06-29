const express = require('express');
const router = express.Router();
const notif = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/auth');
router.get('/', verifyToken, notif.getAll);
router.get('/unread-count', verifyToken, notif.getUnreadCount);
router.put('/mark-all-read', verifyToken, notif.markAllRead);
router.put('/:id/read', verifyToken, notif.markRead);
module.exports = router;
