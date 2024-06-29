const { mAddSales, mGetAllSales, mGetSales, mSaleUpdate, mSaleDelete } = require('../models/salesModel');
const { usernameAuthentification, auth } = require('../services/auth');

const addSales = async (req, res) => {
    // Authentication:
    const authen = await usernameAuthentification(req, res);
    if (authen.userRole != 'ADMIN') {
        return res.status(authen.statusCode).json({ code: authen.code, message: authen.message });
    }

    // Business Logic for ADDING SALES:
    const sales = JSON.parse(req.body.sales);
    const salesLength = Array.isArray(sales) ? sales.length : 1;

    let casedSales = [];
    for (let i = 0; i < salesLength; i++) {
        casedSales.push({
            item_variety_id: sales[i].itemVarietyID,
            is_percentage: sales[i].isPercentage,
            sale_off: sales[i].saleOff,
            expire_day: new Date(sales[i].expireDay),
            start_day: new Date(sales[i].startDay),
            remaining: sales[i].remaining
        });
    }

    mAddSales(casedSales).then((result) => {
        if (result.addResult.length == 0) {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'No sales has been added');
            res.status(404).json({
                "code": "SALE-ADD-ERR",
                "message": "No sales have been added",
                "include": {
                    "user": authen.username,
                    "conflictedSales": result.conflictedSales
                }
            });
            return;
        }
        if (result.addResult.length != salesLength) {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Some sales have been added');
            res.status(200).json({
                "code": "SALE-ADD-PAR",
                "message": "Some sales have been added",
                "include": {
                    "user": authen.username,
                    "conflictedSales": result.conflictedSales
                }
            });
            return;
        }
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'All sales have been added');
        res.status(201).json({
            "code": "SALE-ADD-SUC",
            "message": "All sales have been added",
            "include": {
                "user": authen.username,
                "conflictedSales": result.conflictedSales
            }
        });
        return;

    }).catch((err) => {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', err);
        res.status(500).json({
            "code": "SYS-ERR",
            "message": "A system error has occured during adding sales",
            "include": {
                "user": authen.username
            }
        });
    });
}

const getSales = async (req, res) => {
    const itemID = req.query.itemID;
    let offset = req.query.offset;
    const limit = req.query.limit;
    const runningOnly = req.query.runningOnly === undefined ? true : req.query.runningOnly === 'true';
    const byItemID = req.query.bii === undefined ? true : req.query.runningOnly === 'true';

    if (limit > 30) {
        res.status(403).json({
            "code": "LIMIT-ERR",
            "message": "Limit must be less than or equal to 30"
        });
        return;
    }

    if (itemID) {
        mGetSales(itemID, byItemID, runningOnly).then((sales) => {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Sales have been gotten');
            res.status(200).json({
                "code": "SALE-GET-SUC",
                "message": "Sales have been gotten",
                "data": sales
            });
        }).catch((err) => {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', err);
            res.status(500).json({
                "code": "SYS-ERR",
                "message": "A system error has occured during getting sales"
            });
        });
        return;
    }

    mGetAllSales(runningOnly, offset, limit).then((sales) => {
        if (offset === undefined) {
            offset = 0;
        }
        res.status(200).json({
            "code": "SALE-GET-SUC",
            "message": "Sales have been gotten",
            "data": sales,
            "include": {
                "prev": (offset == 0) ? null : "/sales?offset=" + (offset - 1) + (limit ? "&limit=" + limit : ""),
                "next": sales.length < limit ? null : "/sales?offset=" + (offset + 1) + (limit ? "&limit=" + limit : "")
            }
        })
    }).catch((err) => {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', err);
        res.status(500).json({
            "code": "SYS-ERR",
            "message": "A system error has occured during getting sales"
        });
    });
}

const serialUpdate = async (req, res) => {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [req.body.ids];
    const serialInfos = JSON.parse(req.body.serialInfos);
    const mode = req.body.mode === undefined ? 'SOFT' : req.body.mode;
    const authen = await usernameAuthentification(req, res);
    if (authen.userRole != 'ADMIN') {
        return res.status(authen.statusCode).json({ code: authen.code, message: authen.message });
    }
    if (ids == undefined || serialInfos == undefined || mode == undefined) {
        res.status(400).json({
            "code": "PARAM-ERR",
            "message": "Parameters are not enough"
        });
        return;
    }
    mSaleUpdate(ids, serialInfos).then((result) => {
        if (result.conflicts.length == 0 || mode == 'HARD') { // SUCCESS
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Sales have been updated with ' + mode);
            res.status(200).json({
                "code": "SALE-UPD-SUC",
                "message": "Sales have been updated",
                "conflicts": result.conflicts.map(sales => sales.id)
            });
            return;
        }
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Sales have not been updated due to conflicts');
        res.status(400).json({
            "code": "SALE-UPD-ERR",
            "message": "Sales have not been updated due to conflicts",
            "conflicts": result.conflicts.map(sales => sales.id)
        });
    }).catch((err) => {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', err);
        res.status(500).json({
            "code": "SYS-ERR",
            "message": "A system error has occured during updating sales"
        });
    });
}

const deleteSales = async (req, res) => {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : [req.body.ids];
    const mode = req.body.mode === undefined ? 'SOFT' : req.body.mode;
    const authen = await usernameAuthentification(req, res);
    if (authen.userRole != 'ADMIN') {
        return res.status(authen.statusCode).json({ code: authen.code, message: authen.message });
    }
    if (ids == undefined || mode == undefined) {
        res.status(400).json({
            "code": "PARAM-ERR",
            "message": "Parameters are not enough"
        });
        return;
    }
    mSaleDelete(ids, mode).then((result) => {
        if (result.conflicts.length == 0 || mode == 'HARD') { // SUCCESS
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Sales have been deleted with ' + mode);
            res.status(200).json({
                "code": "SALE-DEL-SUC",
                "message": "Sales have been deleted",
                "conflicts": result.conflicts.map(sales => sales.id)
            });
            return;
        }
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Sales have not been deleted due to conflicts');
        res.status(400).json({
            "code": "SALE-DEL-ERR",
            "message": "Sales have not been deleted due to conflicts",
            "conflicts": result.conflicts.map(sales => sales.id)
        });

    }).catch((err) => {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', err);
        res.status(500).json({
            "code": "SYS-ERR",
            "message": "A system error has occured during deleting sales"
        });
    });
}

module.exports = {
    addSales,
    getSales,
    serialUpdate,
    deleteSales
}