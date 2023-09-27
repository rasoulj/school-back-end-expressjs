const {exec} = require("../../../utils/api_helper");

const Model = require('../models/fees');
const cgen = require("./cgen");

const {deleteById, updateById, getById, create} = cgen(Model);

function getAll(req, res, next) {
    const limit = (req.query.limit || "1")*1;
    const aid = (req.query.aid || "nnw");
    const q = Model.find({aid}, "-__v", {limit, sort: {updatedAt: -1}});//.populate('actors', '-__v');
    exec(q, res, next);
}


module.exports = {
    getById,
    getAll,
    updateById,
    deleteById,
    create
};

