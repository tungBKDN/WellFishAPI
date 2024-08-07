const jwt = require('jsonwebtoken');
const { loginCheck } = require('../models/userAccountModel');
require("dotenv").config({ path: './projectParameter.env'});
const logger = require('../services/logger');


/**
 * Handles user login.
 *
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body.
 * @param {string} req.body.username - User's username.
 * @param {string} req.body.password - User's password.
 * @param {Object} res - Express response object.
 * @returns {Promise<Object>} - Promise representing the result of the login operation. The object contains the username and the result of the login operation.
 * @throws {Error} If an error occurs during login.
 */
const login = async (req, res) => {
    try {
        res.set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Content-Type': 'application/json',
            'Access-Control-Expose-Headers': 'Authorization'
        })
        const username = req.body.username;
        const password = req.body.password;
        const result = await loginCheck(username, password);
        if (result.code == 'LOGIN-SUC') {
            await logger.logger('LOGIN-SUC', 'loginAPI', 'login', `User ${username} is validated`);
            const token = jwt.sign({ username: username }, process.env.SECRET_ACCESS_TOKEN);
            res.set('Authorization', `Bearer ${token}`);
            res.cookie('sessionId', 'your-session-id', {
                httpOnly: true,
                secure: true, // Ensure this is true if you're using HTTPS
                sameSite: 'None'
            });
            res.status(200).json(result);
            return;
        }
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    login
}