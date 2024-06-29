const { usernameAuthentification, auth } = require("../services/auth")
const { mGetContactsByIDs } = require("../models/contactsModel")
const { mGetSaleByID, mSaleUse } = require("../models/salesModel")
const { mGetItemVarietiesByID } = require("../models/itemVariablesModel")
const { mCreateOrder, mGetAllOrders, mGetOrder, mGetPersonalOrders } = require("../models/orderModels")
const { mCreateShippingState } = require("../models/shippingStatesModel")

const newOrder = async (req, res) => {
    // Authentification
    const username = req.body.username;
    let authen = null;
    try {
        authen = await usernameAuthentification(req, res);
        Object.freeze(authen);
    } catch (authenError) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', authenError);
        res.status(403).json({
            code: 'FORBIDDEN',
            message: 'Authentication failed'
        })
        return;
    }
    if (authen.username !== username) {
        res.status(403).json({
            code: 'FORBIDDEN',
            message: 'Authentication failed'
        })
        return;
    }

    // Define the required informations:
    let orderDatas = {
        "item_variety_id": req.body.item_variety_id,
        "amount": req.body.amount,
        "sales_applied_id": req.body.sales_applied_id,
        "coin_used": req.body.coin_used,
        "contact_id": req.body.contact_id,
        "timestamp": new Date().toISOString().replace('T', ' ').substring(0, 19),
        "username": authen.username
    }

    // Append contact_JSON and costs_JSON
    let contact_JSON = {};
    try {
        contact_JSON = await mGetContactsByIDs(authen.username, orderDatas.contact_id, true, false, 1, 0);
        console.log('contact_JSON: ', contact_JSON[0]);
        if (contact_JSON[0]) {
            contact_JSON = contact_JSON[0];
            console.log('contact_JSON: ', contact_JSON);
        }
    } catch (contactErr) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: Internal error during finding contact for _id : ' + orderDatas.contact_id + '\n', contactErr);
        res.status(500).json({
            code: 'INTERNAL_ERROR',
            message: 'Internal error'
        })
        return;
    }

    let item_information_JSON = {
        "item_name": null,
        "item_variety_name": null,
        "item_variety_unit": null,
    }

    // costs_JSON contains the costs includes: item variety's cost at the order time, voucher applied, discounted by sales applied.
    let costs_JSON = {
        "base_cost": 0,
        "voucher_discount": 0,
        "sales_discount": 0,
    }
    try {
        const itemInformations = await mGetItemVarietiesByID(orderDatas.item_variety_id);
        if (itemInformations.data && itemInformations.data.stock_remaining < orderDatas.amount) {
            res.status(400).json({
                code: 'ITEM_OOS',
                message: 'Item out of stock',
                prev_data: orderDatas
            })
            return;
        }
        if (itemInformations.data) {
            costs_JSON.base_cost = itemInformations.data.price;
            item_information_JSON.item_name = itemInformations.data.item_name;
            item_information_JSON.item_variety_name = itemInformations.data.variety_name;
            item_information_JSON.item_variety_unit = itemInformations.data.unit;
        }
    } catch (baseCostErr) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', baseCostErr);
        res.status(500).json({
            code: 'INTERNAL_ERROR',
            message: 'Internal error at finding item variety cost'
        })
        return;
    }

    costs_JSON.voucher_discount = 0;

    try {
        if (orderDatas.sales_applied_id) {
            const saleApplying = await mSaleUse(orderDatas.sales_applied_id, costs_JSON.base_cost, orderDatas.item_variety_id ? orderDatas.item_variety_id : null);
            if (saleApplying.code == 'SALE_USE_OK') {
                costs_JSON.sales_discount = saleApplying.saving_by_sales;
            }
        } else {
            orderDatas.sales_discount = 0;
        }
    } catch (saleAppliedErr) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: Internal error during finding sales for _id : ' + orderDatas.sales_applied_id + '\n', saleAppliedErr);
        res.status(500).json({
            code: 'INTERNAL_ERROR',
            message: 'Internal error at sales applying'
        })
        return;
    }

    // JSON the orderDatas
    orderDatas.contact_JSON = contact_JSON;
    orderDatas.costs_JSON = costs_JSON;
    orderDatas.item_information_JSON = item_information_JSON;


    // Save the orderDatas to database
    try {
        const _result = await mCreateOrder(orderDatas);
        if (!_result) {
            throw new Error('Internal error during saving orderDatas to database');
        }
        const _shippingState = await mCreateShippingState(_result.id, 1);
        if (!_shippingState) {
            throw new Error('Internal error during saving shippingState to database');
        }
        res.status(200).json({
            code: 'ORDER_SUCCESS',
            message: 'Order created',
            data: _result
        })
        return;
    } catch (modelErr) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: Internal error during saving orderDatas to database\n', modelErr);
        res.status(500).json({
            code: 'INTERNAL_ERROR',
            message: 'Internal error'
        })
        return;
    }
}

const Admin_GetOrders = async (req, res) => {
    // Check for admin
    const authen = await usernameAuthentification(req, res);
    if (authen.userRole != 'ADMIN') {
        return res.status(authen.statusCode).json({ code: authen.code, message: authen.message });
    }

    if (req.query.orderID) {
        let order = null;
        try {
            order = await getOrder_Admin(req.query.orderID);
            res.status(200).json(order);
        } catch (error) {
            res.status(error.http_code).json({
                code: error.code,
                message: error.message
            })
        }
        return;
    }

    const textFilter = req.query.textFilter ? req.query.textFilter : "";
    const stateFilter = req.query.stateFilter ? req.query.stateFilter : -1;
    const limit = req.query.limit ? req.query.limit : 30;
    const offset = req.query.offset ? req.query.offset : 0;
    let orders = null;
    try {
        orders = await getOrders_Admin(textFilter, stateFilter, limit, offset);
        res.status(200).json(orders);
    } catch (error) {
        res.status(error.http_code).json({
            code: error.code,
            message: error.message
        })
    }
}

const getOrders_Admin = async (textFilter = "", stateFilter = -1, limit = 30, offset = 0) => {
    try {
        if (limit > 50) {
            limit = 50;
        }
        const orders = await mGetAllOrders(textFilter, stateFilter, limit, offset);
        return {
            "code": "GET_ORDERS_OK @ADMIN",
            "message": "Admin get all orders successfully",
            "data": orders
        }
    } catch (getOrdersAdminError) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: An error occured at <getOrders_Admin>: \n', getOrdersAdminError);
        return {
            "http_code": 500,
            "code": "INTERNAL_ERROR",
            "message": "Internal error"
        }
    }
}

const getOrder_Admin = async (orderID) => {
    try {
        const order = await mGetOrder(orderID);
        return {
            "code": "GET_ORDER_OK @ADMIN",
            "message": "Admin get order successfully",
            "data": order
        }
    } catch (error) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: An error occured at <getOrder_Admin>: \n', error.trace_back);
        throw {
            "http_code": error.http_code,
            "code": error.code,
            "message": error.message
        }
    }
}

const getOrder_User = async (req, res) => {
    let authen = null;
    try {
        authen = await usernameAuthentification(req, res);
        Object.freeze(authen);
    } catch (authenError) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', authenError);
        res.status(403).json({
            code: 'FORBIDDEN',
            message: 'Authentication failed'
        })
        return;
    }
    const id = req.params.id;
    let order = "";
    try {
        order = await mGetOrder(id);
        Object.freeze(order);
    } catch (errorDuringGetOrder) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', errorDuringGetOrder);
        res.status(errorDuringGetOrder.http_code).json({
            code: errorDuringGetOrder.code,
            message: errorDuringGetOrder.message
        })
    }

    if (authen.username !== order.order.username) {
        res.status(403).json({
            code: 'FORBIDDEN',
            message: 'Authentication failed'
        })
        return;
    }
    console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: Order [' + id + '] get successfully');
    return res.status(200).json({
        code: 'GET_ORDER_OK @USER',
        message: 'User get order successfully',
        data: order
    })
}

const getAllOrders_User = async (req, res) => {
    // Authentification
    let authen = null;
    try {
        authen = await usernameAuthentification(req, res);
        Object.freeze(authen);
        const isValid = await auth(authen.username);
        if (isValid == null) {
            throw new Error("Suspicious activity detected");
        }
    } catch (authenError) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', authenError);
        res.status(403).json({
            code: 'FORBIDDEN',
            message: 'Authentication failed'
        })
        return;
    }
    const limit = req.query.limit ? req.query.limit : 30;
    const offset = req.query.offset ? req.query.offset : 0;
    try {
        const orders = await mGetPersonalOrders(authen.username, limit, offset);
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: User [' + authen.username + '] get all orders successfully');
        res.status(200).json({
            code: 'GET_ORDERS_OK @USER',
            message: 'User get all orders successfully',
            data: orders
        })
    } catch (error) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: An error occurs during get all personal orders', error);
        res.status(error.http_code).json({
            code: error.code,
            message: error.message
        })
    }
}

const createShippingState = async (req, res) => {
    try {
        const orderID = req.body.order_id;
        const state = req.body.state;
        if (state < 1 || state > 7) {
            throw {
                "http_code": 400,
                "code": "INVALID_STATE",
                "message": "Invalid state"
            }
        }
        const result = await mCreateShippingState(orderID, state);
        res.status(200).json({
            "code": "CREATE_SHIPPING_STATE_OK",
            "message": "Shipping state created",
            "data": result
        })
        return;
    } catch (error) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: An error occurs during creating shipping state', error);
        res.status(error.http_code).json({
            "code": error.code,
            "message": error.message
        })
        return;
    }
}

module.exports = {
    newOrder,
    Admin_GetOrders,
    getOrder_User,
    getAllOrders_User,
    createShippingState
}