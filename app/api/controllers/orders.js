const {exec, getParams, respFunc} = require("../../../utils/api_helper");

const Model = require('../models/orders');
const WalletsModel = require('../models/wallets');
const UsersModel = require('../models/users');
const HistModel = require('../models/hist');
const cgen = require("./cgen");
const {createOrderNo} = require("../../../utils/wid");

const {deleteById, updateById, getById, create} = cgen(Model);


async function acceptOrder(req, res, next) {
    // console.log(req);
    try {

        const order = getParams(req);
        const {_id, cur, amount, type, wid} = order;


        await Model.findOneAndUpdate({_id, status: "issued"}, {status: "accepted"});//, async (e1, d1) => {

        await WalletsModel.findOneAndUpdate({wid}, {
            $inc: {
                [cur]: type === "topUp" ? amount : 0,
                [cur + "-blocked"]: type === "withdraw" ? -amount : 0
            }
        });
        await HistModel.create({
            ...order,
            isPositive: amount >= 0,
            desc: "Offline order",
            amount: Math.abs(amount)
        });
        await UsersModel.findOne({wid}, (e4, user) => {
            res.json({
                status: 1, data: {
                    notif: {...order, status: "accepted"},
                    user
                }
            });
        });
    } catch (e) {
        res.status(400).send(e);
    }
}

async function rejectOrder(req, res, next) {
    // console.log(req);
    try {
        const order = getParams(req);
        const {_id, type, amount, wid, cur} = order;
        await Model.findOneAndUpdate({_id, status: "issued"}, {status: "rejected"});
        if(type !== "topUp") {
            await WalletsModel.findOneAndUpdate({wid}, {$inc: {[cur]: amount, [cur+"-blocked"]: -amount}})
        }
        UsersModel.findOne({wid}, (e, user) => {
            if(e) next(e);
            else res.json({status: 1, data: {
                notif: {...order, status: "rejected"},
                user
            }});
        });

    } catch (e) {
        res.status(400).send(e);
    }
}

async function acceptTransfer(req, res, next) {
    // console.log(req);
    const order = getParams(req);

    const {_id, cur, amount, wid, transactions, stage, bid, obid, branch: {displayName: bname}, obranch: {displayName: oname}} = order;
    try {
        if(!stage) {
            await Model.findOneAndUpdate({_id, status: "issued"}, {
                stage: 2,
                bid: obid,
                orig_bid: bid
            });
            await UsersModel.findOne({wid}, (e4, user) => {
                const body = "Your transfer has been approved at "+bname+", waiting to be approved at: "+oname;
                res.json({
                    status: 1, data: {
                        notif: {title: bname, body, status: "accepted"},
                        user,
                        stage: 0
                    }
                });
            });
            return;
        }
        await Model.findOneAndUpdate({_id, status: "issued"}, {status: "accepted"});//, async (e1, d1) => {
        await WalletsModel.findOneAndUpdate({wid}, {$inc: {[cur+"-blocked"]: -amount}});
        const trans = (transactions || []).filter(p => !!p.amount);
        let histDocs = [];
        for (const transaction of trans) {
            const {bid, wid, amount, cur, desc, type, ocur = "", oAmount = 0.0, cwid = "", fee = 0.0, hasDone} = transaction;
            if (wid && wid.length > 0) {
                if (!hasDone) await WalletsModel.findOneAndUpdate({wid}, {$inc: {[cur]: amount}});

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
                    amount: Math.abs(amount),
                    orderNo: createOrderNo()
                });
            }

        }

        await HistModel.insertMany(histDocs, (err, data) => {
            if(err) next(err);
            else res.json({status: 1, data: {transactions, stage}});
        });
    } catch (e) {
        res.status(400).send(e);
    }
}

async function acceptExchange(req, res, next) {
    // console.log(req);
    const order = getParams(req);
    try {
        const {_id, cur, amount, wid, transactions = []} = order;
        await Model.findOneAndUpdate({_id, status: "issued"}, {status: "accepted"});//, async (e1, d1) => {
        await WalletsModel.findOneAndUpdate({wid}, {$inc: {[cur+"-blocked"]: -amount}});
        let histDocs = [];
        const trans = (transactions || []).filter(p => !!p.amount);
        for (const transaction of trans) {
            console.log("transaction", transaction);
            const {bid, wid, amount, cur, desc, type, ocur = "", oAmount = 0.0, cwid = "", fee = 0.0, hasDone} = transaction;
            if (wid && wid.length > 0) {
                if(!hasDone) await WalletsModel.findOneAndUpdate({wid}, {$inc: {[cur]: amount}});
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
                    amount: Math.abs(amount),
                    orderNo: createOrderNo()
                });
            }
        }
        await HistModel.insertMany(histDocs, (err, data) => {
            if(err) next(err);
            else res.json({status: 1, data: transactions});
        });
    } catch (e) {
        res.status(400).send(e);
    }
}


function getAll(req, res, next) {
    const limit = (req.query.limit || "1")*1;
    const {query} = req;//.aid || "nnw");

    if(query.limit) delete query.limit;



    const q = Model.find(query, "-__v", {limit, sort: {updatedAt: -1}});//.populate('actors', '-__v');
    exec(q, res, next);
}


module.exports = {
    getById,
    getAll,
    updateById,
    deleteById,
    create,
    acceptOrder,
    acceptTransfer,
    acceptExchange,
    rejectOrder
};

