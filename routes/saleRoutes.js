const express = require('express');
const router = express.Router();
const { addSales, getSales, serialUpdate, deleteSales } = require('../APIs/salesAPI');
const multer = require('multer');
const upload = multer();
const cors = require('cors');

router.route('/').post(cors(), upload.none(), addSales);
router.route('/').get(cors(), getSales);
router.route('/').put(cors(), upload.none(), serialUpdate);
router.route('/').delete(cors(), upload.none(), deleteSales);

module.exports = router;
