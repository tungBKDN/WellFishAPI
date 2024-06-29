const { getUserType } = require('../models/userAccountModel');
const jwt = require('jsonwebtoken');
require("dotenv").config({ path: './projectParameter.env' });

// Define your middleware function
const authUser = async (req, res, next) => {
    const authorizationToken = req.headers['authorization'];
    const token = authorizationToken && authorizationToken.split(' ')[1];

    // this will pass next if the user type is "USER"
    if (!token) {
        return res.status(401).json({
            "code": 'NO-TOKEN',
            "message": 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
        const userType = await getUserType(decoded.username);

        if (userType.type === 'USER') {
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
};

const authAdmin = async (req, res, next) => {
    const authorizationToken = req.headers['authorization'];
    const token = authorizationToken && authorizationToken.split(' ')[1];

    // this will pass next if the user type is "ADMIN"
    if (!token) {
        return res.status(401).json({
            "code": 'NO-TOKEN',
            "message": 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_TOKEN);
        const userType = await getUserType(decoded.username);

        if (userType.type === 'ADMIN') {
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