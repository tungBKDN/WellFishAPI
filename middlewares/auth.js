const { getUserType } = require('../models/userAccountModel');
const jwt = require('jsonwebtoken');
require("dotenv").config({ path: './projectParameter.env' });
const { logger } = require('../services/logger');

// Define your middleware function
const authUser = async (req, res, next) => {
    await logger('AUTH-USER-REQUEST', 'MDW-AUTH', 'User authentication requested', 'at authUser component');
    const authorizationToken = req.headers['authorization'];
    const token = authorizationToken && authorizationToken.split(' ')[1];

    // this will pass next if the user type is "USER"
    if (!token) {
        await logger('AUTH-USER-NO-TOKEN', 'MDW-AUTH', 'No token provided', 'at authUser component');
        return res.status(401).json({
            "code": 'NO-TOKEN',
            "message": 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
        const userType = await getUserType(decoded.username);

        if (userType.type === 'USER') {
            await logger('AUTH-USER-NEXT', 'MDW-AUTH', 'User authentication success', 'at authUser component');
            next();
        } else {
            await logger('AUTH-USER-FORBIDDEN', 'MDW-AUTH', 'Access denied', 'at authUser component');
            return res.status(403).json({
                "code": 'FORBIDDEN',
                "message": 'Access denied'
            });
        }
    } catch (error) {
        await logger('AUTH-USER-INVALID-TOKEN', 'MDW-AUTH', 'Invalid token', 'at authUser component');
        return res.status(401).json({
            "code": 'INVALID-TOKEN',
            "message": 'Invalid token'
        });
    }
};

const authAdmin = async (req, res, next) => {
    await logger('AUTH-ADMIN-REQUEST', 'MDW-AUTH', 'Admin authentication requested', 'at authAdmin component');
    const authorizationToken = req.headers['authorization'];
    const token = authorizationToken && authorizationToken.split(' ')[1];
    await logger('DEV', 'MDW-AUTH', 'Admin authentication requested', `Token: ${token}, Authorization: ${authorizationToken}`);

    // this will pass next if the user type is "ADMIN"
    if (!token) {
        await logger('AUTH-ADMIN-NO-TOKEN', 'MDW-AUTH', 'No token provided', 'at authAdmin component');
        return res.status(401).json({
            "code": 'NO-TOKEN',
            "message": 'No token provided'
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
        const userType = await getUserType(decoded.username);

        if (userType.type === 'ADMIN') {
            await logger('AUTH-ADMIN-NEXT', 'MDW-AUTH', 'Admin authentication success', 'at authAdmin component');
            next();
        } else {
            await logger('AUTH-ADMIN-FORBIDDEN', 'MDW-AUTH', 'Access denied', 'at authAdmin component');
            return res.status(403).json({
                "code": 'FORBIDDEN',
                "message": 'Access denied'
            });
        }
    } catch (error) {
        await logger('AUTH-ADMIN-INVALID-TOKEN', 'MDW-AUTH', 'Invalid token', 'at authAdmin component');
        return res.status(401).json({
            "code": 'INVALID-TOKEN',
            "message": 'Invalid token'
        });
    }
};

const authValid = async (req, res, next) => {
    const authorizationToken = req.headers['authorization'];
    const token = authorizationToken && authorizationToken.split(' ')[1];

    // this will pass next if the user type is "VALID"
    if (!token) {
        return res.status(401).json({
            "code": 'NO-TOKEN',
            "message": 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
        const userType = await getUserType(decoded.username);
        console.log(userType);

        if (userType.type === 'USER' || userType.type === 'ADMIN') {
            next();
        } else {
            return res.status(403).json({
                "code": 'FORBIDDEN',
                "message": 'Access denied'
            });
        }
    } catch (error) {
        return res.status(401).json({
            "code": 'INVALID-TOKEN',
            "message": 'Invalid token'
        });
    }
}

// Export the middleware function
module.exports = {
    authUser,
    authAdmin,
    authValid
}