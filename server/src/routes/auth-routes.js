const express = require('express');
const authController = require('../controllers/auth-controller');
const { protect } = require('../middlewares/auth-middleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

router.patch('/update-password', protect, authController.updatePassword);

module.exports = router;
