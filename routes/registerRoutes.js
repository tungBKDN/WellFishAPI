const express = require('express');
const router = express.Router();
const { usernameAvailable, register } = require('../APIs/registerAPI');
const multer = require('multer');
const upload = multer();
const cors = require('cors');

router.route('/').post(cors(), upload.none(), register)
router.route('/usernameAvailable').post(cors(), upload.none(), usernameAvailable)

module.exports = router;
