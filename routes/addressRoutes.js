const express = require('express');
const router = express.Router();
const { getAllAddresses, validAddress } = require('../APIs/addressAPI');
const multer = require('multer');
const upload = multer();
const cors = require('cors');

router.route('/').get(cors(), getAllAddresses);
router.route('/valid').get(cors(), validAddress);

module.exports = router;
