const cors = require('cors');

const indexCorsOptions = {
    origin: ['http://localhost:3000', 'http://54.254.178.139:3000'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Header', 'X-User-Header', 'Cookie']
};

const adminCorsOptions = {
    origin: ['http://localhost:3000', 'http://54.254.178.139:3000'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Header'],
};

const userCorsOptions = {
    origin: ['http://localhost:3000', 'http://54.254.178.139:3000'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Header'],
};

module.exports = {
    indexCorsOptions: cors(indexCorsOptions),
    adminCorsOptions: cors(adminCorsOptions),
    userCorsOptions: cors(userCorsOptions),
};