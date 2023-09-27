const {createWid} = require("../utils/wid");
const {Roles} = require("../utils/consts");


const {exec, getParams, respFunc} = require("../utils/api_helper");
const rgen = require("./rgen");

const Model = require("../app/api/models/users");

function getById(req, res, next) {
    const q = Model.findOne({uid: req.params.id});
    exec(q, res, next);
}

function getAll(req, res, next) {
    const q = Model.find({role: Roles.AGENCY, verified: true});
    // const q = Model.find({role: Roles.AGENCY_ADMIN, aid: 'fanoos'});
    exec(q, res, next);
}


function updateById(req, res, next) {
    const q = Model.findOneAndUpdate({uid: req.params.id}, getParams(req));
    exec(q, res, next);
}

async function create(req, res, next) {
    const params = getParams(req);
    const {uid} = params;
    Model.create({...params, aid: uid, role: "AGENCY", wid: await createWid()}, respFunc(res, next));
}

function deleteById(req, res, next) {
    const q = Model.findOneAndRemove({uid: req.params.id});
    exec(q, res, next);
}

// module.exports = rgen({getById, updateById, deleteById, getAll, create});


const express = require('express');
const router = express.Router();

router.get('/', getAll);
router.put('/:id', updateById);
// router.post('/', create);

module.exports = router;
