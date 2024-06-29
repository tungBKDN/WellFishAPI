const express = require('express');
const router = express.Router();
const { createContact, getContacts, updateContact, deleteContact } = require('../APIs/contactAPI');
const multer = require('multer');
const upload = multer();
const cors = require('cors');

router.route('/').post(cors(), upload.none(), createContact);
router.route('/').get(cors(), upload.none(), getContacts);
router.route('/').put(cors(), upload.none(), updateContact);
router.route('/').delete(cors(), upload.none(), deleteContact);

module.exports = router;
