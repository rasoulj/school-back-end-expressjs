const express = require('express');
const router = express.Router();
const Controller = require('../app/api/controllers/definitions');

router.post('/__init_all__', Controller.initAll);
router.get('/:category', Controller.getCategory);

module.exports = router;
