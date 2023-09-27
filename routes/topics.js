const express = require('express');
const router = express.Router();
const {getParams, ok, notOk, exec, respFunc} = require("../utils/api_helper");

const Model = require("../app/api/models/topics");

router.get('/:topic', async function (req, res, next) {
    const {topic} = req.params;
    const q = Model.findOne({topic});
    exec(q, res, next);
});

async function putExtra(req, res, next) {
    req.extra = "Salaam";
    next();
}

router.put('/', putExtra, async function put(req, res, next) {
    const params = getParams(req) || {};



    const {tokens, action, topic, memberships = []} = params;


    const body = action === "subscribe" ? {
        $addToSet: {tokens, memberships},
        topic
    } : {
        $pullAll: {tokens, memberships},
        topic
    };

    Model.update({topic}, body, {upsert: true, setDefaultsOnInsert: true}, (err, data) => {
        if(!!err) {
            next();
            return;
        }

        res.json(ok({data, extra: req.extra}));
    });


});

module.exports = router;

