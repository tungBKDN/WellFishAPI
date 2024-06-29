const express = require('express');
const router = express.Router();
const { getPicture } = require('../APIs/pictureAPI');
const multer = require('multer');
const upload = multer();
const cors = require('cors');

router.route('/get/:name').get(cors(), getPicture);

module.exports = router;