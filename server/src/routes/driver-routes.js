const express = require('express');
const driverController = require('./../controllers/driver-controller');
const { protect, restrictTo } = require('../middlewares/auth-middleware');

const router = express.Router();

router.use(protect);
router.patch('/trip_status/:trip_id', restrictTo('driver'), driverController.updateTripStatus);


module.exports = router;
