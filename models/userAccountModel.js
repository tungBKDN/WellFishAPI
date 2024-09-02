const db = require('../schemas')
const bcrypt = require('bcrypt');
const saltRounds = 10;

const loginCheck = async (username, password) => {
    /*
    Exceptions:
    1. username or password undefied
    */
    if (!username || !password) {
        return {
            'code': 'LOGIN-UNDEFINED',
            'message': 'Username or password undefined',
            'role': 'NONE'
        };
    }

    let user = await db.sequelize.query(
        `SELECT user_information.first_name, user_information.last_name, user_information.email, user_account.is_admin, user_account.username, user_account.password, user_information.profile_picture
        FROM user_information INNER JOIN user_account ON user_information.username = user_account.username
        WHERE user_account.username = :username
        LIMIT 1`,
        {
            replacements: { username: username },
            type: db.sequelize.QueryTypes.SELECT
        }
    );

    user = user[0];

    if (!user) {
        return {
            'code': 'LOGIN-NOT-FOUND',
            'message': 'Username not found' ,
            'username': 'NONE',
            'role': 'NONE'
        };
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        return {
            'code': 'LOGIN-WRONG-PASSWORD',
            'message': 'Wrong password',
            'username': 'NONE',
            'role': 'NONE'
        };
    }

    return {
        'code': 'LOGIN-SUC',
        'message': 'Login successfully',
        'username': user.username,
        'role': user.is_admin == 1 ? 'ADMIN' : 'USER',
        include: {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'profile_picture': user.profile_picture
        }
    };
}

/*
* Check if the username is available
* @async
* @param {string} username - User's username.
* @returns {Promise<boolean>} - Promise representing the result of the login operation. The object contains the username and the result of the login operation.
*/
const usernameAvailableCheck = async (username) => {
    const user = await db.user_account.findOne({
        where: {
            username: username
        }
    })
    if (!user) {
        return true;
    }
    return false;
}

const emailAvailableCheck = async (email) => {
    const user = await db.user_information.findOne({
        where: {
            email: email
        }
    })
    if (!user) {
        return true;
    }
    return false;
}

const userRegister = async (data) => {
    console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ' + 'Registering user', data);
    const isAvailable = await emailAvailableCheck(data.email);
    if (!isAvailable) {
        return {
            'code': 'REG-ERR',
            'message': 'Email already in use'
        };
    }

    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    try {
        const result = await db.sequelize.transaction(async (t) => {
            const user = await db.user_account.create({
                username: data.username,
                password: hashedPassword,
                is_admin: 0
            }, { transaction: t });

            await db.user_information.create({
                username: data.username,
                first_name: data.firstName,
                last_name: data.lastName,
                birth: new Date(data.birth),
                email: data.email
            });

            return user;
        });

        return {
            'code': 'REG-SUC',
            'message': 'Register successfully'
        };
    } catch (error) {
        return {
            'code': 'SYS-ERR',
            'message': error.message
        };
    }
}

const getUserType = async (username) => {
    const user = await db.user_account.findOne({
        where: {
            username: username
        }
    })
    if (!user) {
        return {
            'code': 'NOT-FOUND',
            'message': 'User not found'
        };
    }
    return user.is_admin == 1 ? {
        'code': 'GET-SUC',
        'message': 'Get successfully',
        'type': 'ADMIN'
    } : {
        'code': 'GET-SUC',
        'message': 'Get successfully',
        'type': 'USER'
    };
}

module.exports = {
    loginCheck,
    usernameAvailableCheck,
    userRegister,
    getUserType
}