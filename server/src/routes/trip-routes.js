const express = require('express');
const tripController = require('./../controllers/trip-controller');
const { protect } = require('../middlewares/auth-middleware');

const router = express.Router();
router.use(protect);

router.route('/').get(tripController.getAllTrips);
router.route('/:trip_id').get(tripController.getSingleTrip);

module.exports = router;
