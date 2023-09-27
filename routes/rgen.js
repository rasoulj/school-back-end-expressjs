
module.exports = function (Controller) {
    const express = require('express');
    const router = express.Router();

    router.get('/', Controller.getAll);
    router.post('/', Controller.create);
    router.get('/:id', Controller.getById);
    router.put('/:id', Controller.updateById);
    router.delete('/:id', Controller.deleteById);

    if(!!Controller.deleteAll) router.delete('/', Controller.deleteAll);

    return router;
};
