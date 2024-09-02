const { getUpcomingEvents } = require('../models/eventsModel');
const { getImage } = require('../services/pictureServices');

const { mGetIncomeByTime, mMostOrdered } = require('../models/orderModels');
const { mGetShippingStatesByTime } = require('../models/shippingStatesModel');
const  { mGetTotalStockValue } = require('../models/itemVariablesModel')
const { mGetShippingValue } = require('../models/orderModels')
const logger = require('../services/logger');

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
        await logger.logger('DASHBOARD-ADMIN-REQUEST', 'API-DASHBOARD', 'Admin dashboard data requested', '');
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
        await logger.logger('DASHBOARD-ADMIN-RETRIVED', 'API', 'Admin dashboard data retrieved successfully', '');
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

const adminRevenue = async (req, res) => {
    try {
        const value = await mGetTotalStockValue();
        const shippingValue = await mGetShippingValue();
        // Day written as yyyy-mm-dd
        const startDay = req.query.std;
        const endDay = req.query.ed;
        const compareStartDay = req.query.cstd;
        const compareEndDay = req.query.ced;
        let revenueNow = (await mGetIncomeByTime(startDay, endDay)).income;
        let revenueCompare = (await mGetIncomeByTime(compareStartDay, compareEndDay)).income;
        if (revenueNow != 0) {
            revenueCompare = revenueCompare / revenueNow * 100;
            (revenueCompare > 100) ? revenueCompare = revenueCompare - 100 : revenueCompare = 100 - revenueCompare;
        }

        // Success
        res.status(200).json({
            code: 'REVENUE-OK',
            message: 'Revenue data retrieved successfully',
            data: {
                "total_stock_value": value,
                "total_shipping_value": shippingValue,
                "revenue_now": Number(revenueNow),
                "revenue_compare": Number(revenueCompare)
            }
        });
    } catch (error) {
        if (error.http_code == 'undefined') {
            res.status(500).json({
                code: 'SYS-ERR',
                message: 'Internal server error',
                track_back: error
            })
            return;
        }
        res.status(error.http_code).json({
            code: error.code,
            message: error.message,
            trace_back: error.trace_back
        })
    }


}

module.exports = {
    getHomePage,
    adminDashboard,
    adminRevenue
}