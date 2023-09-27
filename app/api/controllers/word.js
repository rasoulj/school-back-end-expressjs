const Model = require('../models/word');
const cgen = require("./cgen");
const {exec, ok, getParams} = require("../../../utils/api_helper");
const fs = require("fs");
const readline = require("readline");

const {deleteById, updateById, getById, getAll, } = cgen(Model);

async function findWord(req, res, next) {
    try {
        const {text} = req.query;
        Model.find({text}).exec(async (err, data) => {
            if(!!err) res.status(500).send(err);
            else {
                if((data || []).length > 0) {
                    const {simple} = data[0];
                    if(simple !== 1) {
                        await Model.findOneAndUpdate({text}, {text, simple: 2, length: (text || "").length}, { upsert: true });
                    }
                }
                res.status(200).send(ok(data));
            }
        });
        // const q = Model.find({text});
        // exec(q, res, next);
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message);
    }
}

async function getRandByLength(req, res, next) {
   try {
       const {len} = req.params;
       const length = 1*len;

       const q = Model.aggregate([
           { $match: {simple: 1, length, report: {$ne: 2}} },
           { $sample: { size: 1 } }
       ]);
       exec(q, res, next);

   } catch (e) {
       console.log(e);
       res.status(500).send(e);
   }
}

function filterReport(data, type) {
    return (data || []).filter(({report, text}) => !!text && report === type).map(({text}) => text);
}

async function getReports(req, res, next) {
    try {
        Model.find({report: {$gte: 1}}, (err, data) => {
            if(!!err) {
                res.status(400).send(err);
            } else {
                const rep1 = filterReport(data, 1);
                const rep2 = filterReport(data, 2);
                res.status(200).send(ok({rep1, rep2}));
            }
        });
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
}

async function reportWord(req, res, next) {
   try {
       const {word: text} = req.params;
        const q = Model.findOneAndUpdate({text}, {report: 1}, {upsert: true}, (err, data) => {
            if(err) next();
            else res.status(200).send(ok([data]));
        });
       // exec(q, res, next);
   } catch (e) {
       console.log(e);
       res.status(500).send(e);
   }
}


async function doReport(req, res, next) {
    try {
        const {rep0 = [], rep1 = [], rep2 = []} = getParams(req);

        Model.updateMany({text: rep2}, {report: 2}, (e2, d2) => {
            if (e2) next();
            else Model.updateMany({text: rep1}, {report: 1}, (e1, d1) => {
                if(e1) next();
                else Model.updateMany({text: rep0}, {report: 0}, (e0, d0) => {
                    if(e0) next();
                    res.status(200).send(ok({d0, d1, d2, rep1}));
                });
            });
        });

        // res.status(200).send(ok({rep0, rep1, rep2}));
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
}


module.exports = {
    getAll,
    deleteById,
    getRandByLength,
    findWord,
    reportWord,
    getReports,
    doReport,
}