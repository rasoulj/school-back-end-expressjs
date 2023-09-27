const express = require('express');
const router = express.Router();
const Controller = require('../app/api/controllers/invoices');

router.get('/invoice/:id', Controller.getById);
router.post('/check', Controller.checkPayment);

module.exports = router;
