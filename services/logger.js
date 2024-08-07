const db = require('../schemas');

const logger = async (code = '', component = '', message = '', traceback = '') => {
    try {
        timestamp = new Date().toISOString();
        const log = new db.syslogs({
            timestamp: timestamp,
            code: code,
            component: component,
            message: message,
            traceback: traceback
        })
        await log.save();
        if (code == '') {
            code = '---';
        }
        if (component == '') {
            component = '---';
        }
        if (message == '') {
            message = '---';
        }
        if (traceback == '') {
            traceback = '---';
        }
        console.log('[' + timestamp.replace('T', ' ').substring(0, 19) + '] : (COD)' + code + ' (COM)' + component + ' (MSG)' + message + ' (TRB)' + traceback);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    logger
}