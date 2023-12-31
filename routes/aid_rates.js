const express = require('express');
const router = express.Router();
const Controller = require('../app/api/controllers/rates');

router.get('/:aid', Controller.getRate);

module.exports = router;
