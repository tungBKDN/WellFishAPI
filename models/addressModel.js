const db = require('../schemas')

const mGetAllAddresses = async () => {
    try {
        const wards = db.wards.findAll();
        const districts = db.district.findAll();
        const provinces = db.province.findAll();
        return { wards, districts, provinces };
    } catch (error) {
        throw error;
    }
}

const mValidAddress = async (address) => {
    const wardID = address.wardID;
    const districtID = address.districtID;
    const provinceID = address.provinceID;

    try {
        const data = await db.sequelize.query(
            `SELECT
                *
            FROM
                wards INNER JOIN district ON wards.district_id = district.district_id
            WHERE 
                wards.wards_id = :wardID
                AND district.district_id = :districtID
                AND district.province_id = :provinceID
            `,
            {
                replacements: { wardID: wardID, districtID: districtID, provinceID: provinceID },
                type: db.sequelize.QueryTypes.SELECT
            }
        )
        if(data.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        throw error;
    }
}

const mAddressString = async (wardID, districtID, provinceID) => {
    try {
        const wardName = await db.wards.findOne({
            where: {
                wards_id: wardID
            }
        });
        const districtName = await db.district.findOne({
            where: {
                district_id: districtID
            }
        });
        const provinceName = await db.province.findOne({
            where: {
                province_id: provinceID
            }
        });
        return `${wardName.name}, ${districtName.name}, ${provinceName.name}`;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    mGetAllAddresses,
    mValidAddress,
    mAddressString
}