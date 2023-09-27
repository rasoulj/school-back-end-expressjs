const {exec} = require("../../../utils/api_helper");

const Model = require('../models/hist');
const cgen = require("./cgen");

const {deleteById, updateById, getById, create} = cgen(Model);

function getAll(req, res, next) {
    const limit = (req.query.limit || "1")*1;
    const {query} = req;//.aid || "nnw");

    if(query.limit) delete query.limit;



    const q = Model.find(query, "-__v", {limit, sort: {createdAt: -1}});//.sort({createdAt: 1});//.populate('actors', '-__v');
    exec(q, res, next);
}


module.exports = {
    getById,
    getAll,
    updateById,
    deleteById,
    create
};

