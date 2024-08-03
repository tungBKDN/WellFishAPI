const db = require('../schemas')
const { mReduceStock, mGetItemVarietiesByID } = require('../models/itemVariablesModel')

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

const mGetIncomeByTime = async (start, end) => {
    try {
        let income = await db.sequelize.query(`
            SELECT
                SUM(CONVERT(JSON_EXTRACT(costs_JSON, '$.base_cost') , DECIMAL)) -
                SUM(CONVERT(JSON_EXTRACT(costs_JSON, '$.sales_discount') , DECIMAL)) -
                SUM(CONVERT(JSON_EXTRACT(costs_JSON, '$.voucher_discount') , DECIMAL)) AS income,
                COUNT(*) AS order_count
            FROM
                orders
            WHERE
                timestamp >= :start
                AND timestamp <= :end;
        `, {
            replacements: { start, end }
        })
        return {
            http_code: 200,
            income: (income[0][0]['income'] == null) ? 0 : income[0][0]['income'],
            order_count: income[0][0]['order_count']
        }
    } catch (error) {
        throw {
            http_code: 500,
            code: 'INTERNAL_ERROR',
            message: 'Internal error',
            trace_back: error
        };
    }
}

const mMostOrdered = async (start, end) => {
    try {
        const itemAndAmount = await db.sequelize.query(`
            SELECT
                item_variety_id, SUM(amount) AS total_amount
            FROM
                orders
            WHERE
                timestamp >= :start
                    AND timestamp <= :end
            GROUP BY item_variety_id
            ORDER BY total_amount DESC
            LIMIT 1;
        `, {
            replacements: { start, end }
        })

        if (itemAndAmount[0].length == 0) {
            const dashboardResult = {
                'item_variety_name': 'Hmm... seems like there is no order during the period :(',
                'total_orders': '--',
                'reorder_rate_percentage': '--.--',
                'repeat_customers': '--',
                'stock_remaining': '--',
                'image': ''
            }
            return {
                'http_code': 200,
                'code': 'ADMIN @DASHBOARD_OK',
                'message': 'Dashboard data fetched successfully',
                'data': dashboardResult
            }
        }
        const itemVarID = itemAndAmount[0][0]['item_variety_id']
        const totalAmount = itemAndAmount[0][0]['total_amount']

        // Get the product name
        const itemVarName = await mGetItemVarietiesByID(itemVarID)
        if (itemVarName.statusCode != 200) {
            throw {
                http_code: 404,
                code: 'ITEM_NOT_FOUND',
                message: 'Item not found',
                trace_back: 'This item might be forced deleted from the database that caused the inconsistency.'
            }
        }

        const reorderRate = await db.sequelize.query(`
            WITH ReorderSummary AS (
                SELECT
                    username,
                    COUNT(*) AS total_orders
                FROM
                    orders
                WHERE
                    timestamp >= :start
                    AND timestamp <= :end
                    AND item_variety_id = :item_variety_id
                GROUP BY username
            )
            SELECT
                SUM(CASE WHEN total_orders > 1 THEN 1 ELSE 0 END) AS repeat_customers,
                COUNT(*) AS total_customers,
                ROUND(
                    (SUM(CASE WHEN total_orders > 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100,
                    2
                ) AS reorder_rate_percentage
            FROM ReorderSummary;
            `, {
            replacements: { start, end, item_variety_id: itemVarID }
        })
        const reorderRatePercentage = reorderRate[0][0]['reorder_rate_percentage']
        const repeatCustomers = reorderRate[0][0]['repeat_customers']

        const dashboardResult = {
            'item_variety_name': itemVarName.item_variety_name,
            'total_orders': totalAmount,
            'reorder_rate_percentage': reorderRatePercentage,
            'repeat_customers': repeatCustomers,
            'stock_remaining': itemVarName.stock_remaining,
            'image': 'http://localhost:3333/public/picture/send/' + itemVarName.image_source
        }
        return {
            'http_code': 200,
            'code': 'ADMIN @DASHBOARD_OK',
            'message': 'Dashboard data fetched successfully',
            'data': dashboardResult
        }

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
    mGetAllOrders, mGetOrder, mGetPersonalOrders,
    mGetIncomeByTime, mMostOrdered
}