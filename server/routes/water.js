const express = require('express');
const router = express.Router();
const water = require('../controllers/waterController');
const { verifyToken } = require('../middleware/auth');
router.get('/status', verifyToken, water.getStatus);
router.post('/status', verifyToken, water.updateStatus);
router.get('/history', verifyToken, water.getHistory);
router.get('/stats', verifyToken, water.getStats);
module.exports = router;
