const express = require('express');
const router = express.Router();
const {
    authenticate,
    register,
    getTops, getUser,
    validateUser, updateUser,
} = require('../app/api/controllers/wusers');

router.post('/', authenticate);
router.post('/reg', register);
router.get('/tops', getTops);
router.get('/:userName', getUser);
router.put('/', validateUser, updateUser);

module.exports = router;
