const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const allow = require('../middleware/roleMiddleware');
const { listUsers, updateUserRole } = require('../controllers/adminController');

router.get('/users', auth, allow('admin'), listUsers);
router.put('/users/:userId/role', auth, allow('admin'), updateUserRole);

module.exports = router;