const express = require('express');
const router = express.Router();
const { getHomePage, adminDashboard } = require('../APIs/homePageAPI');
const multer = require('multer');
const upload = multer();
const cors = require('cors');

router.route('/').get(cors(), getHomePage);
router.route('/admin').get(cors(), adminDashboard);

module.exports = router;
