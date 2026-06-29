const express = require('express');
const router = express.Router();
const n = require('../controllers/neighborController');
const { verifyToken } = require('../middleware/auth');
router.get('/', verifyToken, n.getAll);
router.post('/', verifyToken, n.add);
router.put('/:id', verifyToken, n.update);
router.delete('/:id', verifyToken, n.remove);
module.exports = router;
