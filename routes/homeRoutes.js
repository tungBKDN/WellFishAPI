const express = require('express');
const router = express.Router();
const { getHomePage, adminDashboard } = require('../APIs/homePageAPI');
const multer = require('multer');
const upload = multer();
const { authAdmin } = require('../middlewares/auth');

const { adminCorsOptions } = require('../corsConfig');

router.route('/').get(getHomePage);
router.route('/admin').get(adminCorsOptions, authAdmin, adminDashboard);

module.exports = router;
