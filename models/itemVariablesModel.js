const db = require('../schemas');
const { saveImage, getImage, unlinkImage } = require('../services/pictureServices');
const { logger } = require('../services/logger');
const { http } = require('winston');

const mCreateItemVariable = async (itemVar) => {
    try {
        // save the image
        const image = itemVar.imageSource;

        let newImageAttr = null;
        try {
            newImageAttr = await saveImage(image);
        } catch (savingError) {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: An error occured during saving picure with traceback: \n', savingError);
            throw {
                code: 'SYS-ERR',
                message: 'System error during saving image'
            }
        }

        const result = await db.item_varieties.create({
            item_id: itemVar.itemID,
            variety_name: itemVar.varietyName,
            unit: itemVar.unit,
            price: itemVar.price,
            stock_remaining: itemVar.stockRemaining,
            image_source: newImageAttr.pictureName
        });
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Item variable created successfully');
        return {
            statusCode: 201,
            code: 'ITEMSVAR-CREATE-SUC',
            message: 'Item variable created successfully',
            data: result
        }
    } catch (error) {
        throw {
            statusCode: 500,
            code: 'SYS-ERR',
            message: 'System error during creating item variable'
        }
    }
}

const mGetItemVarietiesByItemID = async (itemID) => {
    try {
        const result = await db.item_varieties.findAll({
            where: {
                item_id: itemID
            }
        });
        if (result.length == 0) {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'No item variable found');
            throw {
                statusCode: 404,
                code: 'ITEMSVAR-GET-NOTFOUND',
                message: 'No item variables found'
            }
        }
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Item variables returned successfully');
        return {
            statusCode: 200,
            code: 'ITEMSVAR-GET-SUC',
            message: 'Item variables returned successfully',
            data: result
        }
    } catch (error) {
        if (error.statusCode === undefined) {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error);
            throw {
                statusCode: 500,
                code: 'SYS-ERR',
                message: 'System error during getting item variables'
            }
        }
        return error;
    }
}

const mGetItemVarietiesByID = async (varietyID) => {
    try {
        const result = await db.sequelize.query(`
        SELECT
            items.id AS item_id,
            items.name AS item_name,
            item_varieties.id AS item_variety_id,
            item_varieties.variety_name,
            item_varieties.unit,
            item_varieties.price,
            item_varieties.stock_remaining,
            item_varieties.image_source
        FROM
            item_varieties
                INNER JOIN
            items ON item_varieties.item_id = items.id
        WHERE
            item_varieties.id = :varietyID;
        `, {
            replacements: { varietyID: varietyID },
        });
        if (result === null) {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Item variable not found');
            throw {
                statusCode: 404,
                code: 'ITEMSVAR-GET-NOTFOUND',
                message: `Item variable with ID ${varietyID} not found`
            }
        }
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Item variable returned successfully');
        return {
            statusCode: 200,
            code: 'ITEMSVAR-GET-SUC',
            message: 'Item variable returned successfully',
            data: result[0][0]
        }
    }
    catch (error) {
        if (error.statusCode === undefined) {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error);
            throw {
                statusCode: 500,
                code: 'SYS-ERR',
                message: 'System error during getting item variable'
            }
        }
        return error;
    }
}

const mGetTotalStockValue = async () => {
    try {
        let value = await db.sequelize.query(`
            SELECT
                SUM(val) as value
            FROM
                (SELECT
                    price * stock_remaining AS val
                FROM
                    item_varieties) v
        `);
        value = value[0][0].value;
        return value;
    } catch (error) {
        logger('SYS-ERR', 'itemVariablesModel.mGetTotalStockValue', error, error);
        throw {
            http_code: 500,
            code: 'SYS-ERR',
            message: 'System error during getting total stock value',
            trace_back: error
        }
    }
}

    const mUpdateItemVarieties = async (variety, image = undefined) => {
        try {
            const isExisted = await db.item_varieties.findOne({
                where: {
                    id: variety.id
                }
            });
            if (isExisted === null) {
                console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Item variable not found');
                return {
                    statusCode: 404,
                    code: 'ITEMSVAR-UPDATE-NOTFOUND',
                    message: `Item variable with ID ${variety.id} not found`
                }
            }

            let newImageAttr = null;
            try {
                if (image) {
                    newImageAttr = await saveImage(image);
                }
            } catch (savingError) {
                console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', savingError);
                throw {
                    statusCode: 500,
                    code: 'SYS-ERR',
                    message: 'System error during saving image'
                }
            }
            const updateData = {};
            if (variety.varietyName) updateData.variety_name = variety.varietyName;
            if (variety.unit) updateData.unit = variety.unit;
            if (variety.price) updateData.price = variety.price;
            if (variety.stockRemaining) updateData.stock_remaining = variety.stockRemaining;
            if (newImageAttr) updateData.image_source = newImageAttr.imageSource;

            const updateResult = await db.item_varieties.update(updateData, {
                where: {
                    id: variety.id
                }
            });
            if (updateResult.length == 0) {
                console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Item variable has not been updated');
                return {
                    statusCode: 404,
                    code: 'ITEMSVAR-UPDATE-ERR',
                    message: 'Item variety has not been updated'
                }
            }
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Item variable has been updated successfully');
            return {
                statusCode: 200,
                code: 'ITEMSVAR-UPDATE-SUC',
                message: 'Item variety has been updated successfully'
            }
        } catch (error) {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error);
            throw {
                statusCode: 500,
                code: 'SYS-ERR',
                message: 'System error during updating item variety'
            }
        }
    }

    const mDeleteItemVarieties = async (varietyID) => {
        try {
            const isExisted = await db.item_varieties.findAll({
                where: {
                    id: varietyID
                }
            });
            // unlink image
            try {
                if (Array.isArray(varietyID)) {
                    for (let i = 0; i < isExisted.length; i++) {
                        if (isExisted[i].image_source) {
                            await unlinkImage(isExisted[i].image_source);
                        }
                    }
                } else {
                    if (isExisted[0].image_source) {
                        await unlinkImage(isExisted[0].image_source);
                    }
                }
            } catch (unlinkError) {
                console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', unlinkError);
                throw {
                    statusCode: 500,
                    code: 'SYS-ERR',
                    message: 'System error during unlinking image'
                }
            }
            const deleteResult = await db.item_varieties.destroy({
                where: {
                    id: varietyID
                }
            });
            const deleteLength = Array.isArray(varietyID) ? varietyID.length : 1;
            if (deleteResult == 0) {
                console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Item variable has not been deleted');
                return {
                    statusCode: 404,
                    code: 'ITEMSVAR-DELETE-ERR',
                    message: 'All item varieties have not been deleted'
                }
            }
            if (deleteResult != deleteLength) {
                console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Some item variables have been deleted successfully');
                return {
                    statusCode: 200,
                    code: 'ITEMSVAR-DELETE-PAR',
                    message: 'Some item variables have been deleted successfully'
                }
            }
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Item variable has been deleted successfully');
            return {
                statusCode: 200,
                code: 'ITEMSVAR-DELETE-SUC',
                message: 'Item varieties have been deleted successfully'
            }
        } catch (error) {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error);
            throw {
                statusCode: 500,
                code: 'SYS-ERR',
                message: 'System error during deleting item variety'
            }
        }
    }

    const mReduceStock = async (varietyID, quantity = 1) => {
        try {
            const isExisted = await db.item_varieties.findOne({
                where: {
                    id: varietyID
                }
            });
            if (isExisted === null) {
                console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Item variable not found');
                return {
                    statusCode: 404,
                    code: 'ITEMSVAR-UPDATE-NOTFOUND',
                    message: `Item variable with ID ${varietyID} not found`
                }
            }
            const updateResult = await db.item_varieties.update({
                stock_remaining: isExisted.stock_remaining - quantity
            }, {
                where: {
                    id: varietyID
                }
            });
            if (updateResult.length == 0) {
                console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Item variable has not been updated');
                return {
                    statusCode: 404,
                    code: 'ITEMSVAR-UPDATE-ERR',
                    message: 'Item variety has not been updated'
                }
            }
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Item variable has been updated successfully');
            return {
                statusCode: 200,
                code: 'ITEMSVAR-UPDATE-SUC',
                message: 'Item variety has been updated successfully'
            }
        } catch (error) {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error);
            throw {
                statusCode: 500,
                code: 'SYS-ERR',
                message: 'System error during updating item variety'
            }
        }
    }

    const mAlterStock = async (mode, varietyID, quantity) => {
        try {
            const isExisted = await db.item_varieties.findOne({
                where: {
                    id: varietyID
                }
            });
            if (!isExisted) {
                return {
                    status_code: 404,
                    code: 'ITEMSVAR-NOTFOUND',
                    message: 'Item variety not found'
                }
            }
            let newStock = 0
            if (mode == "REDUCE" || mode == "ADD") {
                quantity = mode == "REDUCE" ? -quantity : quantity;
                newStock = isExisted.stock_remaining + quantity;
            } else {
                newStock = quantity;
            }
            Object.freeze(newStock);
            const result = await db.item_varieties.update({
                stock_remaining: newStock
            }, {
                where: {
                    id: varietyID
                }
            });
            if (result.length == 0) {
                throw new Error('Item variety has not been updated');
            }
            return {
                status_code: 200,
                code: 'ITEMSVAR-UPDATE-SUC',
                message: 'Item variety has been updated successfully'
            }
        } catch (error) {
            throw {
                status_code: 500,
                code: 'SYS-ERR',
                message: 'System error during updating item variety'
            }
        }
    }

    module.exports = {
        mCreateItemVariable,
        mGetItemVarietiesByItemID, mGetItemVarietiesByID,
        mUpdateItemVarieties,
        mDeleteItemVarieties,
        mGetTotalStockValue,

        mReduceStock, mAlterStock
    }