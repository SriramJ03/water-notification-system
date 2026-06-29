const express = require('express');
const router = express.Router();
const chat = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');
router.get('/', verifyToken, chat.getMessages);
router.delete('/:id', verifyToken, chat.deleteMessage);
module.exports = router;
