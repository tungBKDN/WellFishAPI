const express = require('express');
const router = express.Router();
const { getHomePage } = require('../APIs/homePageAPI');
const multer = require('multer');
const upload = multer();
const cors = require('cors');

router.route('/').get(cors(), getHomePage);

module.exports = router;
