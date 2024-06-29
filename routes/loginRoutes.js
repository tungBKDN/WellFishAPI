const express = require('express');
const router = express.Router();
const { login } = require('../APIs/loginAPI');
const { usernameAvailable, register } = require('../APIs/registerAPI');
const multer = require('multer');
const upload = multer();
const cors = require('cors');

router.route('/').post(cors(), upload.none(), login)

module.exports = router;
