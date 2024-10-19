const jwt = require('jsonwebtoken');
// const multer = require('multer');
const { newItem, getItems, mDeleteItem, mUpdateItem } = require('../models/itemsModel');
const { mCreateItemVariable, mGetItemVarietiesByItemID, mUpdateItemVarieties, mDeleteItemVarieties, mAlterStock } = require('../models/itemVariablesModel');
const { usernameAuthentification, auth } = require('../services/auth');
const { getImage } = require('../services/pictureServices');
const { search } = require('../routes/itemRoutes');

const addNewItem = async (req, res) => {
    // Use auth to check for the username in the token
    const authen = await usernameAuthentification(req, res);
    if (authen.userRole != 'ADMIN') {
        return res.status(authen.statusCode).json({ code: authen.code, message: authen.message });
    }
    const item = {
        name: req.body.name,
        description: req.body.description,
        image: req.file
    }
    try {
        const result = await newItem(item);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}

const deleteItems = async (req, res) => {
    // Use auth to check for the username in the token
    try {
        const authen = await usernameAuthentification(req, res);
        if (authen.userRole != 'ADMIN') {
            return res.status(authen.statusCode).json({ code: authen.code, message: authen.message });
        }
        const itemID = req.body.itemID;
        const modelResult = await mDeleteItem(itemID);
        res.status(modelResult.statusCode).json({
            code: modelResult.code,
            message: modelResult.message
        });
    } catch (error) {
        res.status(500).json(error);
    }
}

const updateItem = async (req, res) => {
    /*
    body {
        itemID: int,
        newName : string,
        newDescription : string,
        newImageSource : string
    }
    */
    try {
        const authen = await usernameAuthentification(req, res);
        if (authen.userRole != 'ADMIN') {
            return res.status(authen.statusCode).json({ code: authen.code, message: authen.message });
        }
        const itemID = req.body.itemID;
        const modifiedInfos = {
            name: req.body.newName,
            description: req.body.newDescription,
            image: req.file
        }
        const modelResult = await mUpdateItem(itemID, modifiedInfos);
        res.status(modelResult.statusCode).json({
            code: modelResult.code,
            message: modelResult.message
        });
    } catch (error) {
        res.status(500).json(error);
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error);
    }
}

const searchItem = async (req, res) => {
    const searchText = req.query.text;
    const offset = req.query.offset;
    // Fixed limit is 30
    try {
        const result = await getItems(searchText, offset, 30);
        if (result.code != 'ITEMS-GET-OK') {
            res.status(404).json({
                code: 'ITEMS-GET-OK',
                message: 'No items found'
            });
            return;
        }
        res.status(200).json({
            code: result.code,
            message: result.message,
            data: result.data
        })
    } catch (error) {
        res.status(500).json(error);
    }
}

const getPagingItems = async (req, res) => {
    const offset = req.params.offset;
    try {
        const result = await getItems('', offset);
        for (let i = 0; i < result.data.length; i++) {
            if (result.data[i].image_source === null) continue;
            result.data[i].image_source = await getImage(result.data[i].image_source);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}

// THIS PART IS FOR ITEM VARIETIES
const addNewItemVarieties = async (req, res) => {
    // Use auth to check for the username in the token
    const authen = await usernameAuthentification(req, res);
    if (authen.userRole != 'ADMIN') {
        return res.status(authen.statusCode).json({ code: authen.code, message: authen.message });
    }

    const subItem = {
        "itemID": req.body.itemID,
        "varietyName": req.body.varietyName,
        "price": req.body.price,
        "stockRemaining": req.body.stockRemaining,
        "imageSource": req.file,
        "unit": req.body.unit
    }

    try {
        const result = await mCreateItemVariable(subItem);
        res.status(result.statusCode).json({
            code: result.code,
            message: result.message
        });
    } catch (error) {
        res.status(error.statusCode).json({
            code: error.code,
            message: error.message
        })
    }
}

const getVarietiesByItemID = async (req, res) => {
    const itemID = req.query.itemID;
    try {
        if (itemID === undefined) {
            throw {
                statusCode: 400,
                code: 'ITEMSVAR-GET-ERR',
                message: 'Item ID is required'
            }
        }
        const result = await mGetItemVarietiesByItemID(itemID);
        res.status(result.statusCode).json({
            code: result.code,
            message: result.message,
            data: result.data
        });
    } catch (error) {
        res.status(error.statusCode).json({
            code: error.code,
            message: error.message
        });
    }
}

const updateItemVarieties = async (req, res) => {
    // Use auth to check for the username in the token
    const authen = await usernameAuthentification(req, res);
    if (authen.userRole != 'ADMIN') {
        return res.status(authen.statusCode).json({ code: authen.code, message: authen.message });
    }

    const variety = JSON.parse(req.body.variety);
    console.log(variety);
    try {
        const result = await mUpdateItemVarieties(variety);
        res.status(result.statusCode).json({
            code: result.code,
            message: result.message
        });
    } catch (error) {
        res.status(error.statusCode).json({
            code: error.code,
            message: error.message
        });
    }
}

const deleteItemVarieties = async (req, res) => {
    // Use auth to check for the username in the token
    const authen = await usernameAuthentification(req, res);
    if (authen.userRole != 'ADMIN') {
        return res.status(authen.statusCode).json({ code: authen.code, message: authen.message });
    }
    const varietyID = JSON.parse(req.body.varietyID);
    try {
        const result = await mDeleteItemVarieties(varietyID);
        res.status(result.statusCode).json({
            code: result.code,
            message: result.message
        });
    } catch (error) {
        res.status(error.statusCode).json({
            code: error.code,
            message: error.message
        });
    }
}

const updateStock = async (req, res) => {
    const mode = req.params.mode;
    const varietyID = req.body.varietyID;
    const quantity = parseInt(req.body.quantity);

    if (varietyID == undefined || quantity < 0) {
        return res.status(400).json({
            code: 'PARAM-UNACCEPTED',
            message: 'Something is wrong with the parameters'
        });
    }

    if (!(mode == "FIXED" || mode == "ADD" || mode == "REDUCE")) {
        return res.status(400).json({
            code: 'PARAM-UNACCEPTED',
            message: 'Variety ID is required'
        });
    }
    try {
        const result = await mAlterStock(mode, varietyID, quantity);
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', "Stock updated successfully");
        res.status(result.status_code).json({
            code: result.code,
            message: result.message
        });
        return;
    } catch (error) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: An error occurred while updating stock', error);
        if (error.status_code) {
            res.status(error.status_code).json({
                code: error.code,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            code: 'SYS-ERR',
            message: 'System error during updating item variety'
        });
    }
}

module.exports = {
    addNewItem,
    getPagingItems,
    deleteItems,
    updateItem,
    addNewItemVarieties,
    getVarietiesByItemID,
    updateItemVarieties,
    deleteItemVarieties,
    updateStock,
    searchItem
}