const {getParams, exec, success, ok, respFunc} = require("../../../utils/api_helper");
// const mongoose = require('mongoose');
const {createOrderNo} = require("../../../utils/wid");

const Model = require('../models/wallets');
const HistModel = require('../models/hist');
// const cgen = require("./cgen");
//
// const {deleteById, updateById, getById, create} = cgen(Model);
//
// function getAll(req, res, next) {
//     const limit = (req.query.limit || "1")*1;
//     const aid = (req.query.aid || "nnw");
//     const q = Model.find({aid}, "-__v", {limit, sort: {updatedAt: -1}});//.populate('actors', '-__v');
//     exec(q, res, next);
// }




async function doWallets(req, res, next) {
    const transactions = getParams(req) || {};

    // const session = await mongoose.startSession();
    // session.startTransaction();

    const histDocs = [];

    const trans = (transactions || []).filter(p => !!p.amount);
    for (const transaction of trans) {
        const {bid, wid, amount, cur, desc, type, ocur = "", oAmount = 0.0, cwid = "", fee = 0.0, owid} = transaction;
        if (wid && wid.length > 0) {
            // const path = `${C.wallets}/${wid}`;
            // let ref = firestore.doc(path);
            // batch.set(ref, {[cur]: increment(amount)}, {merge: true});
            await Model.update({wid}, {$inc: {[cur]: amount}});

            // let refHist = firestore.doc("hist/" + uuid());
            histDocs.push({
                bid,
                isPositive: amount >= 0,
                desc,
                cur,
                type,
                wid,
                ocur,
                oAmount,
                cwid,
                fee,
                owid,
                amount: Math.abs(amount),
                orderNo: createOrderNo()
            });//, {merge: true});
        }

    }

    // console.log(histDocs);

    await HistModel.insertMany(histDocs, respFunc(res, next, "Done"));

    // await session.commitTransaction();
    // await session.endSession();
    // res.json(ok(null, "Updated"));
}

async function update(req, res, next) {
    const {wid} = req.params;
    const body = getParams(req) || {};
    if(body.logged_uid) delete body.logged_uid;
    Model.findOneAndUpdate({wid}, {$inc: body}, (err, data) => {
        // console.log("err:" + err);
        if(err) next(err);
        else {
            if(!data) {
                Model.create({...body, wid}, (e1, d1) => {
                   if(e1) next(e1);
                   else res.json({status: success, data: d1, message: "Updated1"});
                });
            } else {
                res.json({status: success, data, message: "Updated"});
            }
        }
    });
    // exec(q, res, next);
}

async function deleteById(req, res, next) {
    const {wid} = req.params;
    const q = Model.findOneAndRemove({wid});
    exec(q, res, next);

}

async function getById(req, res, next) {
    const {wid} = req.params;
    const q = Model.findOne({wid}, "-_id -__v");
    exec(q, res, next);
}

async function getAll(req, res, next) {
    const q = Model.find({}, "-__v");
    exec(q, res, next);
}


module.exports = {
    getById,
    update,
    deleteById,
    getAll,
    doWallets
};

