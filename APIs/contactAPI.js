const { mCreateContacts, mGetContactsByIDs, mGetContactsByUsername, mUpdateContact, mDeleteContact, mContactByWho} = require('../models/contactsModel')
const { usernameAuthentification } = require('../services/auth')
const { mValidAddress } = require('../models/addressModel')

const createContact = async (req, res) => {
    try {
        const contact = JSON.parse(req.body.contact);
        const authen = await usernameAuthentification(req, res);
        if (contact.username != authen.username) {
            res.status(403).json({
                code: 'FORBIDDEN',
                message: 'Authentication failed'
            })
            return;
        }

        if (!contact) {
            res.status(404).json({
                code: 'PARAM-NOT-ENOUGH',
                message: 'There is at least one parameter on vacant',
            })
            return;
        }

        const isValid = await mValidAddress({ "wardID": contact.ward_id, "districtID": contact.district_id, "provinceID": contact.province_id });
        if (!isValid) {
            res.status(404).json({
                code: 'ADDRESS-INVALID',
                message: 'Contact contains invalid address'
            })
            return;
        }

        const modelResult = await mCreateContacts(contact);
        if (modelResult.length == 0) {
            res.status(404).json({
                code: 'CNTAC-ADD-FAIL',
                message: 'Some errors have occured made contact added 0 rows.'
            })
            return;
        }

        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Contact added successfully');
        res.status(201).json({
            code: 'CNTAC-ADD-SUC',
            message: 'Contact added successfully.'
        })
        return;
    } catch (error) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error);
        res.status(500).json({
            code: 'SYS-ERR',
            message: 'Unknown error'
        })
    }
}

const getContacts = async (req, res) => {
    try {
        const authen = await usernameAuthentification(req, res);
        if (req.query.username != authen.username) {
            res.status(403).json({
                code: 'FORBIDDEN',
                message: 'Authentication failed'
            })
            return;
        }

        const ids = Array.isArray(req.query.ids) ? req.query.ids : req.query.ids;
        const limit = req.query.limit ? req.query.limit : 15;
        const offset = req.query.offset ? req.query.offset : 0;
        const username = req.query.username;
        const stringOnly = req.query.stringOnly ? req.query.stringOnly : false;

        if (!ids) {
            if (!username) {
                console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'There is at least one parameter is on vacant');
                res.status(404).json({
                    code: 'PARAM-NOT-ENOUGH',
                    message: 'There is at least one parameter is on vacant',
                })
                return;
            }

            const modelResult = await mGetContactsByUsername(authen.username, stringOnly, limit, offset);
            if (modelResult.length == 0) {
                console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Some error has occured made contact added 0 rows.');
                res.status(404).json({
                    code: 'CNTAC-GET-FAIL',
                    message: 'Some error has occured made contact added 0 rows.',
                    data: []
                })
                return;
            }
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Contact added successfully');
            res.status(200).json({
                code: 'CNTAC-GET-SUC',
                message: 'Contact get successfully.',
                data: modelResult
            });
            return;
        }

        const modelResult = await mGetContactsByIDs(authen.username, ids, limit, offset);
        if (modelResult.length == 0) {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Some error has occured made contact get 0 rows.');
            res.status(404).json({
                code: 'CNTAC-GET-FAIL',
                message: 'Some error has occured made contact added 0 rows.',
                data: []
            })
            return;
        }
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Contact get successfully');
        res.status(200).json({
            code: 'CNTAC-GET-SUC',
            message: 'Contact get successfully.',
            data: modelResult
        });
        return;

    } catch (error) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error);
        res.status(500).json({
            code: 'SYS-ERR',
            message: 'Unknown error'
        })
    }
}

const updateContact = async (req, res) => {
    let authen = null;
    try {
        authen = await usernameAuthentification(req, res);
        Object.freeze(authen);
    } catch (authenError) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', authenError);
        res.status(403).json({
            code: 'FORBIDDEN',
            message: 'Authentication failed'
        })
        return;
    } 

    const id = req.body.id;
    if (!req.body.contact || !id) {
        res.status(404).json({
            code: 'PARAM-NOT-ENOUGH',
            message: 'There is at least one parameter is on vacant',
        })
        return;
    }
    try {
        const byUsername = await mContactByWho(id);
        if (byUsername != authen.username) {
            res.status(403).json({
                code: 'FORBIDDEN',
                message: 'Authentication failed'
            })
            return;
        }
    } catch (getUsernameError) {
        res.status(500).json({
            code: 'SYS-ERR',
            message: 'Unknown error'
        })
    }

    try {
        const updateResult = await mUpdateContact(id, req.body.contact);
        if (updateResult.length == 0) {
            res.status(404).json({
                code: 'CNTAC-UPDATE-FAIL',
                message: 'Some error has occured made contact added 0 rows.'
            })
            return;
        }
        res.status(200).json({
            code: 'CNTAC-UPDATE-SUC',
            message: 'Contact updated successfully.'
        })
    } catch (error) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error);
        res.status(500).json({
            code: 'SYS-ERR',
            message: 'Unknown error'
        })
    }
}

const deleteContact = async (req, res) => {
    let authen = null;
    try {
        authen = await usernameAuthentification(req, res);
        Object.freeze(authen);
    } catch (authenError) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', authenError);
        res.status(403).json({
            code: 'FORBIDDEN',
            message: 'Authentication failed'
        })
        return;
    } 

    const id = req.body.id;
    if (!id) {
        res.status(404).json({
            code: 'PARAM-NOT-ENOUGH',
            message: 'There is at least one parameter is on vacant',
        })
        return;
    }

    try {
        const byUsername = await mContactByWho(id);
        if (byUsername != authen.username) {
            res.status(403).json({
                code: 'FORBIDDEN',
                message: 'Authentication failed'
            })
            return;
        }
    } catch (getUsernameError) {
        res.status(500).json({
            code: 'SYS-ERR',
            message: 'Unknown error'
        })
    }

    try {
        const deleteResult = await mDeleteContact(id);
        if (deleteResult == 0) {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Some errors have occured made contact deleted 0 rows.');
            res.status(404).json({
                code: 'CNTAC-DELETE-FAIL',
                message: 'Some errors have occured made contact added 0 rows.'
            })
            return;
        }
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Contact deleted successfully');
        res.status(200).json({
            code: 'CNTAC-DELETE-SUC',
            message: 'Contact deleted successfully.'
        })
    } catch (error) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error);
        res.status(500).json({
            code: 'SYS-ERR',
            message: 'Unknown error'
        })
    }
}

module.exports = {
    createContact,
    getContacts,
    updateContact,
    deleteContact,
}