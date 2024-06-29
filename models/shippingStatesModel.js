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
        const shippingState = await db.shipping_state.create({ order_id: orderID, state: state, timestamp: new Date()});
        return shippingState;
    } catch (error) {
        throw error;
    }
}

const mGetLatestShippingState = async (orderID) => {
    try {
        const shippingState = await db.shipping_state.findOne({ where: { order_id: orderID }, order: [['timestamp', 'DESC']], limit: 1});
        return shippingState;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    mGetShippingState, mGetShippingStates, mGetLatestShippingState,
    mCreateShippingState,
}