const express = require('express');
const router = express.Router();
const { newOrder, Admin_GetOrders, getOrder_User, getAllOrders_User, createShippingState } = require('../APIs/orderAPI');
const { authAdmin, authUser, authValid } = require("../middlewares/auth")
const multer = require('multer');
const upload = multer();
const cors = require('cors');

router.route('/').post(cors(), upload.none(), newOrder);
router.route('/admin').get(cors(), Admin_GetOrders);
router.route('/:id').get(cors(), getOrder_User);
router.route('/').get(cors(), getAllOrders_User);
router.route('/state').post(cors(), authUser, upload.none(), createShippingState);

module.exports = router;
