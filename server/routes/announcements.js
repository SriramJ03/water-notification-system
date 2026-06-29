const express = require('express');
const router = express.Router();
const ann = require('../controllers/announcementController');
const { verifyToken, isAdmin } = require('../middleware/auth');
router.get('/', verifyToken, ann.getAll);
router.post('/', verifyToken, isAdmin, ann.create);
router.delete('/:id', verifyToken, isAdmin, ann.delete);
module.exports = router;
