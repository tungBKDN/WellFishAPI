const express = require('express');
const router = express.Router();
const { getPictureBase64, sendPicture } = require('../APIs/pictureAPI');
const multer = require('multer');
const upload = multer();
const cors = require('cors');

router.route('/get/:name').get(cors(), getPictureBase64);
router.route('/send/:name').get(cors(), sendPicture);

module.exports = router;