const express = require('express');
const router = express.Router();
const Controller = require('../app/api/controllers/orders');


router.get('/', Controller.getAll);
router.post('/', Controller.create);
router.post('/acceptOrder', Controller.acceptOrder);
router.post('/rejectOrder', Controller.rejectOrder);
router.post('/acceptExchange', Controller.acceptExchange);
router.post('/acceptTransfer', Controller.acceptTransfer);
router.get('/:id', Controller.getById);
router.put('/:id', Controller.updateById);
router.delete('/:id', Controller.deleteById);

module.exports = router;
