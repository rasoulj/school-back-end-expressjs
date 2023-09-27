const express = require('express');
const router = express.Router();
const Controller = require('../app/api/controllers/invoices');

router.post('/', Controller.create);
router.post('/commit', Controller.doPayment);

module.exports = router;
