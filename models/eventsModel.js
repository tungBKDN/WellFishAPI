const db = require('../schemas');

const getUpcomingEvents = async () => {
    const currentTime = new Date();
    // Find all events that are not yet expired
    const result = await db.events.findAll({
        where: {
            end_time: {
                [db.Sequelize.Op.gt]: currentTime
            }
        },
        order: [
            ['start_time', 'ASC']
        ]
    })
    return result;
}

module.exports = {
    getUpcomingEvents
}