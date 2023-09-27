const express = require('express');
const router = express.Router();
const Controller = require('../app/api/controllers/wallets');


router.post('/', Controller.doWallets);
router.post('/:wid', Controller.update);
router.get('/:wid', Controller.getById);
router.delete('/:wid', Controller.deleteById);
router.get('/', Controller.getAll);

module.exports = router;

/*
{
  "status": 1,
  "data": [
    {
      "_id": "606d8de238ef745280693e36",
      "usd": 100,
      "irr": 1000,
      "createdAt": "2021-04-07T10:48:02.216Z",
      "updatedAt": "2021-04-07T10:48:02.216Z"
    },
    {
      "_id": "606d8df938ef745280693e37",
      "usd": 100,
      "irr": 1000,
      "createdAt": "2021-04-07T10:48:25.998Z",
      "updatedAt": "2021-04-07T10:48:25.998Z"
    },
    {
      "_id": "606d8dff38ef745280693e38",
      "usd": 100,
      "irr": 1000,
      "createdAt": "2021-04-07T10:48:31.158Z",
      "updatedAt": "2021-04-07T10:48:31.158Z"
    },

  ]
}
 */
