const express = require('express');
const userController = require('../controllers/user-controller');
const { protect, restrictTo } = require('../middlewares/auth-middleware');

const router = express.Router();

router.use(protect);

router.get('/my-profile', userController.getMyProfile);
router.patch('/update-me',  userController.updateMe);

router
  .route('/')
  .get(userController.getAllUsers)
  .post( userController.createNewUser);

router
  .route('/:id')
  .get( userController.getOneUser)
  .patch( userController.updateOneUser)
  .delete( userController.deleteOneUser);

module.exports = router;
