const { getUpcomingEvents } = require('../models/eventsModel');
const { getImage } = require('../services/pictureServices');

const { mGetIncomeByTime, mMostOrdered } = require('../models/orderModels');
const { mGetShippingStatesByTime } = require('../models/shippingStatesModel');

const getHomePage = async (req, res) => {
    try {
        console.log('GET /api/home');
        let data = {};
        // TODO: Get events
        data.events = await getUpcomingEvents();
        for (let i = 0; i < data.events.length; i++) {
            if (data.events[i].image === null) continue;
            const event = data.events[i];
            event.image = await getImage(event.image);
        }

        // TODO: Authorization, if not logged in, announcements, profile and delivering states are not loaded

        // TODO: Get announcements

        // TODO: Get profile

        // TODO: Get delivering states
        res.status(200).json({ code: 'HOME-OK', message: 'Success', data });
    } catch (error) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error);
        res.status(500).json({ code: 'SYS-ERR', message: 'Internal server error' });
    }
}

const adminDashboard = async (req, res) => {
    try {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        // Finances
        const finances = await mGetIncomeByTime(start, end);
        if (finances.http_code !== 200) {
            res.status(finances.http_code).json({ code: finances.code, message: finances.message });
            return;
        }
        // Orders
        const orders = await mGetShippingStatesByTime(start, end);
        if (orders.http_code !== 200) {
            res.status(orders.http_code).json({ code: orders.code, message: orders.message });
            return;
        }
        // Products
        const products = await mMostOrdered(start, end);
        if (products.http_code !== 200) {
            res.status(products.http_code).json({ code: products.code, message: products.message });
            return;
        }

        const dashboard = {
            "start": start.toLocaleString('default', { month: 'short' }) + ' ' + start.getFullYear(),
            "finances": {
                "total_income": finances.income,
                "total_orders": finances.order_count,
                "average_rating": "-.--"
            },
            "orders": {
                "pending": orders.pending,
                "shipping": orders.shipping,
                "arrived": orders.arrived,
                "cancelled": orders.cancelled
            },
            "products": products.data
        }
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: Dashboard data retrieved successfully');
        res.status(200).json(
            {
                code: 'DASHBOARD-OK',
                message: 'Dashboard data retrieved successfully',
                data: dashboard
            }
        );
        return;
    } catch (error) {
        if (error.http_code) {
            res.status(error.http_code).json({ code: error.code, message: error.message });
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error.trace_back);
        } else {
            res.status(500).json({ code: 'SYS-ERR', message: 'Internal server error' });
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error);
        }
    }
}

module.exports = {
    getHomePage,
    adminDashboard
}