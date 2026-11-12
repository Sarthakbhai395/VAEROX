const express = require('express');
const {
  getAdminCustomFits,
  updateCustomFitStatus
} = require('../controllers/customFitController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.route('/admin').get(getAdminCustomFits);
router.route('/admin/:id/status').patch(updateCustomFitStatus);

module.exports = router;

