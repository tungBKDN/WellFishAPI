const db = require('../schemas');
const { Op } = require('sequelize');
const { loginCheck } = require('./userAccountModel');

const mAddSales = (sales) => {
    return new Promise((resolve, reject) => {
        handleSales(sales).then((result) => {
            const okSales = result.okSales;
            const conflictedSales = result.conflictedSales;
            db.sales.bulkCreate(okSales)
                .then((addResult) => {
                    resolve({ addResult, conflictedSales });
                })
                .catch((err) => {
                    reject(err);
                });
        }).catch((err) => {
            reject(err);
        });
    }).catch((err) => {
        reject(err);
    });
}

async function handleSales(sales) {
    let conflictedSales = [];
    let okSales = [];
    for (let i = 0; i < sales.length; i++) {
        const result = await isConflicted(sales[i]);
        if (result) {
            conflictedSales.push(sales[i]);
        } else {
            okSales.push(sales[i]);
        }
    }
    return { okSales, conflictedSales };
}

const isConflicted = (sale) => {
    return new Promise((resolve, reject) => {
        db.sales.findAll({
            where: {
                [Op.and]: [
                    {
                        item_variety_id: sale.item_variety_id
                    },
                    {
                        [Op.or]: [
                            {
                                start_day: {
                                    [Op.gte]: sale.start_day,
                                    [Op.lt]: sale.expire_day
                                }
                            },
                            {
                                expire_day: {
                                    [Op.gt]: sale.start_day,
                                    [Op.lte]: sale.expire_day
                                }
                            }
                        ]
                    }
                ]
            },
            limit: 1
        })
            .then(result => {
                if (result && result.length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .catch(err => {
                reject(err);
            });
    });
}

const mGetSales = (itemID, byItemID, runningOnly = true) => {
    return new Promise((resolve, reject) => {
        db.sequelize.query(
            `SELECT 
                sales.id, sales.item_variety_id, sales.is_percentage, sales.sale_off, sales.expire_day, sales.start_day, sales.remaining, sales.maximum_off
                item_varieties.variety_name, 
                items.id AS item_id, items.name AS item_name
            FROM 
                (sales INNER JOIN item_varieties ON sales.item_variety_id = item_varieties.id) 
                INNER JOIN items ON item_varieties.item_id = items.id
            WHERE 
                ${byItemID ? 'sales.item_variety_id' : 'item_id'} = :itemID 
                ${runningOnly ? 'AND sales.start_day <= :today AND sales.expire_day >= :today' : ''}
            `,
            {
                replacements: { itemID: itemID, today: new Date() },
                type: db.sequelize.QueryTypes.SELECT
            }
        )
            .then(sales => {
                resolve(sales);
            })
            .catch(err => {
                reject(err);
            });
    });
}

const mGetAllSales = (runningOnly = true, offset = 0, limit = 10) => {
    return new Promise((resolve, reject) => {
        db.sequelize.query(
            `SELECT 
                sales.id, sales.item_variety_id, sales.is_percentage, sales.sale_off, sales.expire_day, sales.start_day, sale.remaining, sales.maximum_off,
                item_varieties.variety_name, 
                items.id AS item_id, items.name AS item_name
            FROM
                (sales INNER JOIN item_varieties ON sales.item_variety_id = item_varieties.id)
                INNER JOIN items ON item_varieties.item_id = items.id
            WHERE
                ${runningOnly ? 'sales.start_day <= :today AND sales.expire_day >= :today' : ''}
            LIMIT :limit OFFSET :offset
            `,
            {
                replacements: { today: new Date(), limit: limit, offset: offset },
                type: db.sequelize.QueryTypes.SELECT
            })
            .then(sales => {
                resolve(sales);
            })
            .catch(err => {
                reject(err);
            });
    });
}


const mSaleUpdate = (ids, updateInfos, mode = 'SOFT') => {
    return new Promise((resolve, reject) => {
        console.log(ids);
        db.sales.findAll({
            where: {
                [Op.and]: [
                    {
                        id: {
                            [Op.in]: ids
                        }
                    },
                    {
                        start_day: {
                            [Op.lte]: new Date()
                        }
                    }
                ]
            }
        })
            .then(conflicts => {
                if (mode == 'SOFT' && conflicts.length > 0) {
                    resolve({ conflicts });
                    return;
                }
                db.sales.update({
                    'sale_off': '0.00'
                }, {
                    where: {
                        id: {
                            [Op.in]: ids
                        }
                    }
                }).then((result) => {
                    resolve({ result, conflicts });
                })
            })
            .catch(err => {
                reject(err);
            });
    });
}

const mSaleDelete = (ids, mode = 'SOFT') => {
    return new Promise((resolve, reject) => {
        console.log(ids);
        db.sales.findAll({
            where: {
                [Op.and]: [
                    {
                        id: {
                            [Op.in]: ids
                        }
                    },
                    {
                        start_day: {
                            [Op.lte]: new Date()
                        }
                    }
                ]
            }
        })
            .then(conflicts => {
                if (mode == 'SOFT' && conflicts.length > 0) {
                    resolve({ conflicts });
                    return;
                }
                db.sales.destroy({
                    where: {
                        id: {
                            [Op.in]: ids
                        }
                    }
                })
                    .then((result) => {
                        resolve({ result, conflicts });
                    })
            })
            .catch(err => {
                reject(err);
            });
    });
}

const mGetSaleByID = async (id) => {
    let sale = await db.sales.findOne({
        where: {
            id: id
        }
    });
    return sale;
}

const mSaleUse = async (saleId, cost, variety_id = null) => {
    let _apply = await mSaleApply(saleId, variety_id);
    if (_apply.code != 'SALE_APPLY_OK') {
        _apply.setAttributes('saving_by_sales', 0);
        return _apply;
    }

    const _reduceNumber = await db.sequelize.query(
        `
            UPDATE sales
            SET remaining = remaining - 1
            WHERE sales.id = :saleId;
        `,
        {
            replacements: { saleId: saleId }
        }
    );
    
    if (_reduceNumber.length == 0) {
        return { code: 'SALE_REDUCE_FAIL', message: 'Fail to reduce sale remaining number' };
    }

    const _sale = await mGetSaleByID(saleId);

    let savings = 0;
    if (_sale.is_percentage) {
        savings = cost * _sale.sale_off;
        if (savings > _sale.maximum_off) {
            savings = _sale.maximum_off;
        }
    } else {
        savings = _sale.sale_off;
    }
    console.log('Savings: ', savings, cost, _sale.sale_off, _sale.is_percentage, _sale.maximum_off)
    return {
        code: 'SALE_USE_OK',
        message: 'Sale used',
        saving_by_sales: savings
    }
}

const mSaleApply = async (saleID, variety_id = null) => {
    const _sale = await mGetSaleByID(saleID);

    if (!_sale) {
        return { code: 'NOT_FOUND', message: 'Sale not found' };
    }

    if (_sale.start_day > new Date() || _sale.expire_day < new Date()) {
        return { code: 'SALE_UNAVAIL', message: 'Sale not running' };
    }

    if (variety_id == null && _sale.item_variety_id != variety_id) {
        return { code: 'SALE_FORBIDDEN', message: 'Sale not for this item variety' };
    }

    return {
        code: 'SALE_APPLY_OK',
        message: 'Sale can be applied'
    }
}

module.exports = {
    mAddSales,
    mGetSales, mGetAllSales, mGetSaleByID,
    mSaleUpdate,
    mSaleDelete,

    mSaleUse
}