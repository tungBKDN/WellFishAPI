const { usernameAvailableCheck, userRegister } = require('../models/userAccountModel');

const usernameAvailable = async (req, res) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
    })
    try {
        const username = req.body.username;
        if (await usernameAvailableCheck(username)) {
            res.status(200).json({ code: 'USN-AVL', message: 'Username available' });
            return;
        }
        res.status(200).json({ code: 'USN-UAVL', message: 'Username not available' });
    } catch (error) {
        res.status(500).json({ code: 'SYS-ERR', message: error.message });
    }
}

const register = async (req, res) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
    })
    try {
        const data = req.body;
        const result = await userRegister(data);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ code: 'SYS-ERR', message: error.message });21
    }
}

module.exports = {
    usernameAvailable,
    register
}