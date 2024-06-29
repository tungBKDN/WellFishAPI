const jwt = require('jsonwebtoken');
// const multer = require('multer');
const { newItem, getAllItems, mDeleteItem, mUpdateItem } = require('../models/itemsModel');
const { mCreateItemVariable, mGetItemVarietiesByItemID, mUpdateItemVarieties, mDeleteItemVarieties } = require('../models/itemVariablesModel');
const { usernameAuthentification, auth } = require('../services/auth');
const { getImage } = require('../services/pictureServices');

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
    const searchText = req.body.searchText;
    //TODO: search item
}

const getPagingItems = async (req, res) => {
    const offset = req.params.offset;
    try {
        const result = await getAllItems(offset);
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

module.exports = {
    addNewItem,
    getPagingItems,
    deleteItems,
    updateItem,
    addNewItemVarieties,
    getVarietiesByItemID,
    updateItemVarieties,
    deleteItemVarieties
}