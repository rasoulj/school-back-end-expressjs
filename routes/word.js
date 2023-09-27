const express = require('express');
const router = express.Router();
const Controller = require('../app/api/controllers/word');

router.get('/report/:word', Controller.reportWord);
router.get('/report', Controller.getReports);
router.post('/report', Controller.doReport);
router.get('/:len', Controller.getRandByLength);
router.get('/', Controller.findWord);

module.exports = router;
