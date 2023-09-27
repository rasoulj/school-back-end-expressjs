const express = require('express');
const router = express.Router();
const Controller = require('../app/api/controllers/users');


router.post('/', Controller.save);
router.post('/otp', Controller.setOtp);
router.post('/changePassword', Controller.changePassword);
router.get('/', Controller.all);
router.get('/:aid/:phone', Controller.getUserByPhone);
// router.get('/balance', Controller.getBalance);
router.get('/:aid/:phone/balance', Controller.getBalanceByPhone);
router.put('/:aid/:phone/balance', Controller.putBalanceByPhone);
// router.put('/balance', Controller.putBalance);
router.get('/:uid', Controller.findById);
router.put('/:uid', Controller.findByIdAndUpdate);

//router.get('/', Controller.findByEmail);
router.delete('/:id', Controller.deleteById);

module.exports = router;
