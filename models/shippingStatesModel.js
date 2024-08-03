const db = require('../schemas')

const mGetShippingState = async (id) => {
    try {
        const shippingState = await db.shipping_state.findOne({ where: { id } });
        return shippingState;
    } catch (error) {
        throw error;
    }
}

const mGetShippingStates = async (limit = 30, offset = 0) => {
    try {
        const shippingStates = await db.shipping_state.findAll({ limit, offset });
        return shippingStates;
    } catch (error) {
        throw error;
    }
}

const mCreateShippingState = async (orderID, state) => {
    try {
        const existed = await db.shipping_state.findOne({ where: { order_id: orderID, state: Number(state) } });
        if (existed != null) {
            throw {
                "http_code": 400,
                "message": "This state has already been created for this order.",
                "code": "SHIPPING_STATE_EXISTED"
            }
        }
        const shippingState = await db.shipping_state.create({ order_id: orderID, state: state, timestamp: new Date() });
        return shippingState;
    } catch (error) {
        if (error.code != null) {
            throw error;
        }
        throw {
            "http_code": 500,
            "message": "An error occurred while creating the shipping state.",
            "code": "CREATE_SHIPPING_STATE_FAILED",
            "trace_back": error.toString(),
        }
    }
}

const mGetLatestShippingState = async (orderID) => {
    try {
        const shippingState = await db.shipping_state.findOne({ where: { order_id: orderID }, order: [['timestamp', 'DESC']], limit: 1 });
        return shippingState;
    } catch (error) {
        throw error;
    }
}

const mGetShippingStatesByTime = async (start, end) => {
    try {
        const statesCount = await db.sequelize.query(`
            SELECT
                s.state, COALESCE(COUNT(ss.timestamp), 0) AS count
            FROM
                (SELECT 'PENDING' AS state UNION ALL SELECT 'SHIPPING' UNION ALL SELECT 'ARRIVED' UNION ALL SELECT 'CANCELLED') AS s
                    LEFT JOIN
                shipping_state ss ON s.state = ss.state
                    AND ss.timestamp >= :start
                    AND ss.timestamp <= :end
            GROUP BY s.state;
        `, {
            replacements: { start, end }
        });
        return {
            http_code: 200,
            "pending": statesCount[0].find(e => e.state === 'PENDING').count,
            "shipping": statesCount[0].find(e => e.state === 'SHIPPING').count,
            "arrived": statesCount[0].find(e => e.state === 'ARRIVED').count,
            "cancelled": statesCount[0].find(e => e.state === 'CANCELLED').count
        };
    } catch (error) {
        throw {
            http_code: 500,
            code: 'INTERNAL_ERROR',
            message: 'Internal error',
            trace_back: error
        }
    }
}

module.exports = {
    mGetShippingState, mGetShippingStates, mGetLatestShippingState,
    mCreateShippingState,
    mGetShippingStatesByTime
}