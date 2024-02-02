const express = require('express');
const riderController = require('./../controllers/rider-controller');
const { protect, restrictTo } = require('../middlewares/auth-middleware');

const router = express.Router();

router.use(protect);

router.post('/ride_request', restrictTo('rider'), riderController.createRideRequest);
router.post('/ride_cancel/:trip_id', restrictTo('rider'), riderController.cancelRideRequest);

module.exports = router;
