const {exec, ok, getParams, respFunc} = require("../../../utils/api_helper");

const Model = require('../models/atickets');
const cgen = require("./cgen");

const {deleteById, updateById, getById, create} = cgen(Model);


function deleteAll(req, res, next) {
    const {logged_uid} = req.body;
    const q = Model.deleteMany({logged_uid});
    exec(q, res, next);
}

function getAll(req, res, next) {
    const {logged_uid} = req.body;

    console.log("logged_uid3", logged_uid);

    // res.json(ok(TICKETS, logged_uid));
    // return;
    //TODO:

    const q = Model.find({logged_uid}, "-__v");//, {sort: {updatedAt: -1}});//.populate('actors', '-__v');
    exec(q, res, next);
}




module.exports = {
    getById,
    getAll,
    updateById,
    deleteById,
    create,
    // deleteAll
};

