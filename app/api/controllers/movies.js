const Model = require("../models/movies");
const cgen = require("../controllers/cgen");

const PARAMS = 'name released_on actors';

const {deleteById, updateById, getById, create} = cgen(Model, PARAMS);

const {exec} = require("../../../utils/api_helper");


function getAll(req, res, next) {
    const q = Model.find({}, "-__v").populate('actors', '-__v');
    exec(q, res, next);
}


module.exports = {
    getById,
    getAll,
    updateById,
    deleteById,
    create
};
