const express = require('express');
const router = express.Router();
const em = require('../controllers/emergencyController');
const { verifyToken } = require('../middleware/auth');
router.get('/', verifyToken, em.getEmergencies);
router.post('/', verifyToken, em.sendEmergency);
router.put('/:id/resolve', verifyToken, em.resolve);
module.exports = router;
