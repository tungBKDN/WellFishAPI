const db = require('../schemas')
const { mReduceStock } = require('../models/itemVariablesModel')

const mCreateOrder = async (orderDatas) => {
    let _result = null
    try {
        _result = db.orders.create(orderDatas)
    } catch (addingOrderErr) {
        throw {
            message: 'Internal error during adding order',
            error: addingOrderErr
        }
    }

    try {
        const _reducingResult = mReduceStock(orderDatas.item_variety_id, orderDatas.amount)
    } catch (reducingStockErr) {
        throw {
            message: 'Internal error during reducing stock',
            error: reducingStockErr
        }
    }
    return _result;
}

const mGetAllOrders = async (textFilter = "", state = -1, limit = 30, offset = 0) => {
    try {
        let orders = []
        if (state == -1) {
            // get the order that has the latest shipping state
            orders = await db.sequelize.query(`
                SELECT orders.id as order_id, item_variety_id, amount, costs_JSON, orders.timestamp as order_timestamp, item_information_JSON, contact_JSON, state, shipping_state.timestamp as shipping_timestamp
                FROM orders INNER JOIN shipping_state ON orders.id = shipping_state.order_id
                WHERE shipping_state.timestamp = (SELECT MAX(timestamp) FROM shipping_state WHERE order_id = orders.id) AND (JSON_EXTRACT(item_information_JSON, "$.item_name") COLLATE utf8mb4_unicode_ci LIKE '%${textFilter}%' OR JSON_EXTRACT(item_information_JSON, "$.item_variety_name") COLLATE utf8mb4_unicode_ci LIKE '%${textFilter}%')
                ORDER BY order_timestamp DESC
                LIMIT ${limit} OFFSET ${offset};
            `)
        } else {
            orders = await db.sequelize.query(`
            SELECT orders.id as order_id, item_variety_id, amount, costs_JSON, orders.timestamp as order_timestamp, item_information_JSON, contact_JSON, state, shipping_state.timestamp as shipping_timestamp
            FROM orders INNER JOIN shipping_state ON orders.id = shipping_state.order_id
            WHERE shipping_state.state = ${state} AND (JSON_EXTRACT(item_information_JSON, "$.item_name") COLLATE utf8mb4_unicode_ci LIKE '%${textFilter}%' OR JSON_EXTRACT(item_information_JSON, "$.item_variety_name") COLLATE utf8mb4_unicode_ci LIKE '%${textFilter}%')
            ORDER BY order_timestamp DESC
            LIMIT ${limit} OFFSET ${offset};
            `)
        }
        return orders;
    } catch (error) {
        throw error;
    }
}

const mGetOrder = async (id) => {
    let order = ""
    try {
        order = await db.orders.findOne({ where: { id } });
        Object.freeze(order);
        // order length
        if (!order) {
            throw {
                http_code: 404,
                code: 'ORDER_NOT_FOUND',
                message: 'Order not found'
            }
            return;
        }
    } catch (error1) {
        throw error1;
    }
    try {
        const shippingState = await db.shipping_state.findAll({ where: { order_id: id } });
        return {
            "order": order,
            "state": shippingState
        };
    } catch (error) {
        throw {
            http_code: 500,
            code: 'INTERNAL_ERROR',
            message: 'Internal error',
            trace_back: error
        };
    }
}

const mGetPersonalOrders = async (username, limit = 30, offset = 0) => {
    try {
        let orders = await db.sequelize.query(`
            SELECT orders.id as order_id, item_variety_id, amount, costs_JSON, orders.timestamp as order_timestamp, item_information_JSON, contact_JSON, state, shipping_state.timestamp as shipping_timestamp
            FROM orders INNER JOIN shipping_state ON orders.id = shipping_state.order_id
            WHERE username = :username AND shipping_state.timestamp = (SELECT MAX(timestamp) FROM shipping_state WHERE order_id = orders.id)
            ORDER BY order_timestamp DESC
            LIMIT :limit OFFSET :offset;
        `, {
            replacements: { username, limit, offset }
        })
        return orders;
    } catch (error) {
        throw {
            http_code: 500,
            code: 'INTERNAL_ERROR',
            message: 'Internal error',
            trace_back: error
        };
    }
}

module.exports = {
    mCreateOrder,
    mGetAllOrders, mGetOrder, mGetPersonalOrders
}