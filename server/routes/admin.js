const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/auth');
router.get('/users', verifyToken, isAdmin, admin.getUsers);
router.put('/users/:id/toggle', verifyToken, isAdmin, admin.toggleUser);
router.delete('/users/:id', verifyToken, isAdmin, admin.deleteUser);
router.get('/stats', verifyToken, isAdmin, admin.getDashboardStats);
module.exports = router;
