const { getUpcomingEvents } = require('../models/eventsModel');
const { getImage } = require('../services/pictureServices');

const getHomePage = async (req, res) => {
    try {
        console.log('GET /api/home');
        let data = {};
        // TODO: Get events
        data.events = await getUpcomingEvents();
        for (let i = 0; i < data.events.length; i++) {
            if (data.events[i].image === null) continue;
            const event = data.events[i];
            event.image = await getImage(event.image);
        }

        // TODO: Authorization, if not logged in, announcements, profile and delivering states are not loaded

        // TODO: Get announcements

        // TODO: Get profile

        // TODO: Get delivering states
        res.status(200).json({ code: 'HOME-OK', message: 'Success', data });
    } catch (error) {
        console.log('[' + new Date().toISOString().replace('T', ' ').substring(0, 19) + ']: ', error);
        res.status(500).json({ code: 'SYS-ERR', message: 'Internal server error' });
    }
    
    
}

module.exports = {
    getHomePage
}