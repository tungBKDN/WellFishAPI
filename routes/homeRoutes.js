const express = require('express');
const router = express.Router();
const { getHomePage, adminDashboard } = require('../APIs/homePageAPI');
const multer = require('multer');
const upload = multer();
const { authAdmin } = require('../middlewares/auth');

const { adminCorsOptions } = require('../corsConfig');

// Define allowed origins
const allowedOrigins = ['http://localhost:3000'];

// CORS configuration
// const corsOptions = {
//     origin: function (origin, callback) {
//         if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization'],
// };

router.route('/').get(getHomePage);
router.route('/admin').get(adminCorsOptions, authAdmin, adminDashboard);

module.exports = router;
