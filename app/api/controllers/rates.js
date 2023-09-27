const {exec, notOk, ok, getDocs} = require("../../../utils/api_helper");

const Model = require('../models/rates');
const cgen = require("./cgen");

const {deleteById, updateById, getById, create} = cgen(Model);

function getAll(req, res, next) {
    const limit = (req.query.limit || "1")*1;
    const {aid, bid} = req.query;//.aid || "nnw");

    let filter = {};
    if(aid) filter = {aid};
    if(bid) filter = {...filter, bid};

    const q = Model.find(filter, "-__v", {limit, sort: {updatedAt: -1}});//.populate('actors', '-__v');
    exec(q, res, next);
}

function normalRates(wallet) {
    const {
        iqd = 1,
        usd = 1,
        aed = 1,
        eur = 1,
        cny = 1,
        irr = 1,
        gbp = 1,
        aud = 1,
        cad = 1,
    } = wallet || {};
    return {iqd, usd, aed, eur, cny, irr, gbp, aud, cad}
}


function getRate(req, res, next) {
    const limit = 1;

    const {aid} = req.params;
    // res.send(ok(aid));
    // return;

    // const {aid, bid} = req.query;//.aid || "nnw");

    let filter = {aid};
    if(aid) filter = {aid};

    Model.find(filter, "-__v", {limit, sort: {updatedAt: -1}}, (e, data) => {
       if(e) res.send(notOk(e));
       else {
           const rates = getDocs(data);
           res.send(ok( normalRates(rates.length > 0 ? rates[0] : null) ));
       }
    });
}


module.exports = {
    getById,
    getAll,
    updateById,
    deleteById,
    create,
    getRate,
};

