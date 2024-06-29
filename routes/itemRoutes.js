const express = require('express');
const router = express.Router();
const { addNewItem, getPagingItems, deleteItems, updateItem, addNewItemVarieties, getVarietiesByItemID, updateItemVarieties, deleteItemVarieties } = require('../APIs/itemAPI');
const multer = require('multer');
const upload = multer();
const cors = require('cors');


// ITEMS
router.route('/addItem').post(cors(), upload.single('item-image'), addNewItem)
router.route('/getAllItems').get(cors(), getPagingItems)
router.route('/deleteItems').delete(cors(), upload.none(), deleteItems)
router.route('/updateItem').put(cors(), upload.single('item-image'), updateItem)

// SUB-ITEMS
router.route('/addItemVarieties').post(cors(), upload.single('subitem-image'), addNewItemVarieties)
router.route('/getVarietiesByItemID').get(cors(), upload.none(), getVarietiesByItemID)
router.route('/updateItemVarieties').put(cors(), upload.none(), updateItemVarieties)
router.route('/deleteItemVarieties').delete(cors(), upload.none(), deleteItemVarieties)

module.exports = router;
