const multer = require('multer');
require("dotenv").config({ path: './projectParameter.env'});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, process.env.PICTURE_PATH);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

console.log('Picture upload service is ready');