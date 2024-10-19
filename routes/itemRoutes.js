const express = require('express');
const router = express.Router();
const { addNewItem, searchItem, getPagingItems, deleteItems, updateItem, addNewItemVarieties, getVarietiesByItemID, updateItemVarieties, deleteItemVarieties, updateStock } = require('../APIs/itemAPI');
const multer = require('multer');
const upload = multer();
const cors = require('cors');
const { authAdmin } = require('../middlewares/auth');

// ITEMS
router.route('/addItem').post(cors(), upload.single('item-image'), addNewItem)
router.route('/getItems').get(cors(), getPagingItems)
router.route('/searchItems').get(cors(), searchItem)
router.route('/deleteItems').delete(cors(), upload.none(), deleteItems)
router.route('/updateItem').put(cors(), upload.single('item-image'), updateItem)

// SUB-ITEMS
router.route('/addItemVarieties').post(cors(), upload.single('subitem-image'), addNewItemVarieties)
router.route('/getVarietiesByItemID').get(cors(), upload.none(), getVarietiesByItemID)
router.route('/updateItemVarieties').put(cors(), upload.none(), updateItemVarieties)
router.route('/deleteItemVarieties').delete(cors(), upload.none(), deleteItemVarieties)
router.route('/stock/:mode').put(cors(), upload.none(), authAdmin, updateStock)

module.exports = router;
