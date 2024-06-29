const { getUserType } = require('../models/userAccountModel');
const jwt = require('jsonwebtoken');
require("dotenv").config({ path: './projectParameter.env' });

const usernameAuthentification = async (req, res) => {
    const authorizationToken = req.headers['authorization'];
    const token = authorizationToken && authorizationToken.split(' ')[1];
    if (!token) {
        return {
            statusCode: 401,
            code: 'NO-TOKEN',
            message: 'No token provided',
            userRole: null,
            username: null
        }
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
        const userType = await getUserType(decoded.username);
        if (userType === 'USER') {
            return {
                statusCode: 403,
                code: 'NO-PERMISSION',
                message: 'User role is not allowed to access this resource',
                userRole: 'USER',
                username: decoded.username
            }
        }
        return {
            statusCode: 200,
            code: 'TOKEN-OK',
            message: 'Token is valid',
            userRole: 'ADMIN',
            username: decoded.username
        };
    }
    catch (error) {
        return {
            statusCode: 403,
            code: 'INVALID-TOKEN',
            message: 'Invalid token',
            userRole: null,
            username: null
        }
    }
}

const auth = async (username) => {
    const userType = await getUserType(username);
    return userType.type;
}

module.exports = {
    usernameAuthentification,
    auth
}