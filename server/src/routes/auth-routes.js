const express = require('express');
const authController = require('../controllers/auth-controller');
const { protect } = require('../middlewares/auth-middleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/driver-login-otp', authController.driverLoginOTP);
router.post('/driver-login', authController.driverLogin);

router.patch('/update-password', protect, authController.updatePassword);

module.exports = router;
