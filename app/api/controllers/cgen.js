const {getParams, exec, respFunc} = require("../../../utils/api_helper");

module.exports = function (Model, params) {
    return {
        getById: function (req, res, next) {
            const q = Model.findById(req.params.id, "-__v");
            exec(q, res, next);
        },
        getAll: function (req, res, next) {
            const q = Model.find({}, "-__v");
            exec(q, res, next);
        },
        updateById: function (req, res, next) {
            const q = Model.findByIdAndUpdate(req.params.id, getParams(req, params));
            exec(q, res, next);
        },
        deleteById: function (req, res, next) {
            const q = Model.findByIdAndRemove(req.params.id);
            exec(q, res, next);
        },
        create: function (req, res, next) {
            Model.create(getParams(req, params), respFunc(res, next));
        }
    }
};
