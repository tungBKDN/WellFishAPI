const db = require('../schemas');
const fse = require('fs-extra');
const path = require('path');
const {} = require('./itemVariablesModel');
const { saveImage } = require('../services/pictureServices');

const newItem = async (item) => {
    const image = item.image;

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
    try {
        const result = await db.items.create({
            name: item.name,
            description: item.description,
            image_source: newImageAttr.pictureName,
        })
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: Request to insert', item, 'was successful');
        return {
            code: 'ITEMS-INS-OK',
            message: 'Item inserted successfully',
        };
    } catch (error) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error);
        throw {
            code: 'SYS-ERR',
            message: 'System error during adding new item'
        }
    }
}

const getAllItems = async (offset = 0, limit = 10) => {
    try {
        const items = await db.items.findAll({
            offset: offset,
            limit: limit,
            order: [['name', 'ASC']]
        });
        return {
            code: 'ITEMS-GET-OK',
            data: items
        };
    } catch (error) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error);
        throw {
            code: 'SYS-ERR',
            message: 'System error during fetching items'
        }
    }
}

// TODO: delete item with itemID could be an array or just one itemID
const mDeleteItem = async (itemID) => {
    const itemQueueCount = (Array.isArray(itemID) ? itemID.length : 1);
    try {
        const items = await db.items.findAll({
            where: {
                id: itemID
            }
        });
        const item_variety_ids = db.item_varieties .findAll({
            where: {
                item_id: {
                    [Op.in]: [
                        itemID
                    ]
                }
            }
        });
        const itemVarietyIDs = item_variety_ids.map(item => item.id);
        const imageSources = items.map(item => item.image_source);
        for (let i = 0; i < imageSources.length; i++) {
            await fse.unlink(path.join(process.env.PICTURE_PATH, imageSources[i]));
        }
        const subItemDeleteResult = await db.item_varieties.destroy({
            where: {
                id: {
                    [Op.in]: itemVarietyIDs
                }
            }
        });
        const queryResult = await db.items.destroy({
            where: {
                id: itemID
            }
        });

        switch (itemQueueCount - queryResult) {
            case 0:
                console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: Request to delete item(s) with id(s)', itemID, 'was successful');
                return {
                    statusCode: 200,
                    code: 'ITEMS-DEL-OK',
                    message: 'Item(s) deleted successfully'
                };
            case itemQueueCount:
                console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: Request to delete item(s) with id(s)', itemID, 'was unsuccessful');
                return {
                    statusCode: 404,
                    code: 'ITEMS-DEL-ERR',
                    message: 'All item(s) has/have not deleted'
                };
            default:
                console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: Request to delete item(s) with id(s)', itemID, 'was partially successful');
                return {
                    statusCode: 206,
                    code: 'ITEMS-DEL-PARTIAL',
                    message: 'Item(s) not deleted'
                };
        }
    } catch (error) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error);
        throw {
            statusCode: 500,
            code: 'SYS-ERR',
            message: 'System error during deleting item(s)'
        }
    }
}

const mUpdateItem = async (itemID, modifiedInfos) => {
    try {
        const casedData = {};
        if (modifiedInfos.name) casedData.name = modifiedInfos.name;
        if (modifiedInfos.description) casedData.description = modifiedInfos.description;

        // TODO: rewrite with 'save file'
        let newImageAttr = null;
        try {
            if (modifiedInfos.image != null) {
                newImageAttr = await saveImage(modifiedInfos.image);
            }
            modifiedInfos.image_source = newImageAttr.imageSource;
        } catch (savingError) {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: An error occured during saving picure ' + newImageName + ' with traceback: \n', savingError);
            throw {
                code: 'SYS-ERR',
                message: 'System error during saving image'
            }
        }

        const queryResult = await db.items.update(casedData, {
            where: {
                id: itemID
            }
        });
        if (queryResult == 0) {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: Request to update item with id', itemID, 'was unsuccessful');
            return {
                statusCode: 404,
                code: 'ITEMS-UPD-ERR',
                message: 'Item not updated'
            };
        }
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: Request to update item with id', itemID, 'was successful');
        return {
            statusCode: 200,
            code: 'ITEMS-UPD-OK',
            message: 'Item updated successfully'
        };
    } catch (error) {
        throw {
            statusCode: 500,
            code: 'SYS-ERR',
            message: 'System error during updating item',
            details: error
        }
    }
}

module.exports = {
    newItem,
    getAllItems,
    mDeleteItem,
    mUpdateItem
}
