const express = require('express');
const router = express.Router();
const { login } = require('../APIs/loginAPI');
const { usernameAvailable, register } = require('../APIs/registerAPI');
const multer = require('multer');
const upload = multer();
const { indexCorsOptions } = require('../corsConfig')

router.route('/').post(indexCorsOptions, upload.none(), login)

module.exports = router;
