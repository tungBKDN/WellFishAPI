const { mGetAllAddresses, mValidAddress } = require('../models/addressModel');

const getAllAddresses = async (req, res) => {
    try {
        const data = await mGetAllAddresses();
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Get all addresses successfully');
        res.status(200).json({
            code: 'ADDRESS-GET-OK',
            message: 'Get all addresses successfully',
            wards: data.wards,
            districts: data.districts,
            provinces: data.provinces
        })
    } catch (error) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Get all addresses failed with error traceback:\n ', error);
        res.status(500).json({
            code: 'ADDRESS-GET-ERR',
            message: 'Get all addresses failed with error'
        });
    }
}

const validAddress = async (req, res) => {
    try {
        const wardID = req.query.wd;
        const districtID = req.query.dt;
        const provinceID = req.query.pr;

        if (!wardID || !districtID || !provinceID) {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Valid address failed');
            res.status(400).json({
                code: 'ADDRESS-UNDEFINED',
                message: 'Address is undefined'
            });
            return;
        }

        const isValid = await mValidAddress({ wardID, districtID, provinceID });
        if (isValid) {
            console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Valid address successfully');
            res.status(200).json({
                code: 'ADDRESS-VALID',
                message: 'Address is valid'
            });
            return;
        }
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Valid address failed');
        res.status(200).json({
            code: 'ADDRESS-INVALID',
            message: 'Address is invalid'
        });
    } catch (error) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', 'Valid address failed with error traceback:\n ', error);
        res.status(500).json({
            code: 'SYS-ERR',
            message: 'Valid address failed with error'
        });
    }
}

module.exports = {
    getAllAddresses,
    validAddress
}