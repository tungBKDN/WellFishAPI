const db = require('../schemas')
const { mAddressString  } = require('./addressModel')

const mCreateContacts = async (contact) => {
    try {
        const createResult = await db.contacts.create(contact);
        return createResult;
    } catch (error) {
        throw error;
    }
}

const mGetContactsByUsername = async (username, stringOnly, limit = 15, offset = 0) => {
    try {
        let selectResult = await db.contacts.findAll({
            where: {
                username: username
            },
            limit: limit,
            offset: offset
        });
        if (stringOnly) {
            for (let i = 0; i < selectResult.length; i++) {
                let addrss = await mAddressString(selectResult[i].ward_id, selectResult[i].district_id, selectResult[i].province_id);
                selectResult[i].setDataValue('str_address', addrss);
            }
        }
        return selectResult;
    } catch (error) {
        throw error;
    }
}

const mGetContactsByIDs = async (username, ids, stringOnly, getAllForce = false, limit = 15, offset = 0) => {
    try {
        let selectResult = await db.contacts.findAll({
            where: {
                id: ids,
                username: username
            },
            limit: (getAllForce ? null : limit),
            offset: (getAllForce ? null : offset)
        });
        if (stringOnly) {
            for (let i = 0; i < selectResult.length; i++) {
                let addrss = await mAddressString(selectResult[i].ward_id, selectResult[i].district_id, selectResult[i].province_id);
                selectResult[i].setDataValue('str_address', addrss);
            }
        }
        return selectResult;
    } catch (error) {
        throw error;
    }
}

const mUpdateContact = async (id, newInfos) => {
    try {
        const updateResult = await db.contacts.update(newInfos, {
            where: {
                id: id
            }
        });
        return updateResult;
    } catch (error) {
        throw error;
    }
}

const mDeleteContact = (id) => {
    try {
        const deleteResult = db.contacts.destroy({
            where: {
                id: id
            }
        });
        return deleteResult;
    } catch (error) {
        throw error;
    }
}

const mContactByWho = async (id) => {
    try {
        const usernameSelect = await db.contacts.findOne({
            where: {
                id: id
            },
            attribute: ['username']
        });
        if (usernameSelect == null) {
            return null;
        }
        return usernameSelect.username;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    mCreateContacts,
    mGetContactsByIDs, mGetContactsByUsername,
    mUpdateContact,
    mDeleteContact,
    mContactByWho
}