const Model = require('../models/invoices');
const UsersModel = require('../models/users');
const HistModel = require('../models/hist');
const WalletsModel = require('../models/wallets');

const {getParams, ok, notOk, exec, respFunc, getDocs, getDoc, success, } = require("../../../utils/api_helper");
const cgen = require("./cgen");


const {deleteById, updateById, getById: old} = cgen(Model);

async function getById(req, res, next) {
    try {
        const data = await Model.findById(req.params.id, "-__v").populate('owner', "-_id wid role displayName phone").lean().exec();
        const {createdAt} = data;
        const cat = pastDate(0) - Date.parse(createdAt);
        res.status(200).send(ok({...data, count: Math.floor(cat/1000)}));
    } catch (e) {
        res.status(200).send(notOk(e));
    }
}

function isValidHttpUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}


function pastDate(minutes = 2) {
    return new Date(Date.parse(new Date().toISOString()) - 1000 * 60 * minutes);
}



async function doPayment(req, res, next) {
    try {
        const updatedAt = {
            $gt: pastDate(5)
        };

        const {invoiceNo} = getParams(req);

        const debug = false;

        const invoiceCond = debug ? {_id: invoiceNo} : {_id: invoiceNo, updatedAt, invoiceStatus: "CHECKED"};
        const invoice = await Model.findOne(invoiceCond).lean().exec();

        if(!invoice) {
            res.status(200).send(notOk(`invoiceNo: ${invoiceNo} is invalid or has been expired`));
            return;
        }

        const {cur, amount, merchant, user} = invoice;

        if(!merchant) {
            res.status(200).send(notOk("The customer and merchant do not belong to the same Agency."));
            return;
        }

        const {wid} = user || {};

        const wallet = await WalletsModel.findOne({wid}).lean().exec();
        if(!wallet || !cur) {
            res.status(200).send(notOk("No wallet is assigned to the user or no CUR specified."));
            return ;
        }

        const available = !wallet[cur] ? 0 : wallet[cur];

        if(available < amount) {
            res.status(200).send(notOk("Not enough deposit"));
            return ;
        }

        const {wid: mwid} = merchant;

        await WalletsModel.findOneAndUpdate({wid}, {$inc: {[cur]: -amount}}).exec();
        await WalletsModel.findOneAndUpdate({wid: mwid}, {$inc: {[cur]: amount}}).exec();

        const order = {
            status: "accepted",
            cur,
            type: "gateway-t",
            isPositive: true,
            desc: "Paid by gateway",
            amount
        };

        await HistModel.create({...merchant, ...order});
        await HistModel.create({...user, ...order, isPositive: false});

        await Model.findOneAndUpdate({_id: invoiceNo}, {invoiceStatus: "PAYED"});


        res.status(200).send(ok({invoiceNo, merchant: (merchant ?? {}).displayName, user: (user ?? {}).displayName}, "Invoice has been payed successfully."));
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
}


async function checkPayment(req, res, next) {
    try {
        const updatedAt = {
            $gt: pastDate(2)
        };

        const createdAt = {
            $gt: pastDate(15)
        };

        const {otp, wid, invoiceNo} = getParams(req);
        console.log(otp, wid, invoiceNo);
        const debug = false;// false && otp === 25374;

        const userCond = debug ? {wid} : {wid, otp, updatedAt};
        const user = await UsersModel.findOne(userCond).lean().exec();

        console.log(userCond, user);

        if(!user) {
            res.status(200).send(notOk("Invalid OTP, WID combination, or OTP has been expired."));
            return;
        }
        if(user._id) delete user._id;

        console.log(user.updatedAt, updatedAt);

        const invoiceCond = debug ? {_id: invoiceNo} : {_id: invoiceNo, createdAt, invoiceStatus: "ISSUED"};
        const invoice = await Model.findOne(invoiceCond).lean().exec();
        if(!invoice) {
            res.status(200).send(notOk(`invoiceNo: ${invoiceNo} is invalid or has been expired`));
            return;
        }


        const {logged_uid: uid, cur, amount} = invoice;
        const merchant = await UsersModel.findById(uid).lean().exec();

        if(!merchant || merchant.aid !== user.aid && !debug) {
            res.status(200).send(notOk("The customer and merchant do not belong to the same Agency."));
            return;
        }
        if(merchant._id) delete merchant._id;

        const wallet = await WalletsModel.findOne({wid}).lean().exec();
        if(!wallet || !cur) {
            res.status(200).send(notOk("No wallet is assigned to the user or no CUR specified."));
            return ;
        }

        const available = !wallet[cur] ? 0 : wallet[cur];

        if(available < amount) {
            res.status(200).send(notOk("Not enough deposit"));
            return ;
        }

        const data = {
            invoiceStatus: "CHECKED",
            merchant,
            user,
        };

        await Model.findOneAndUpdate({_id: invoiceNo}, data);
        res.status(200).send(ok(data, "Invoice has been checked, and ready to pay"));
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
}

function create(req, res, next) {
    const params = getParams(req);
    const {cancelUrl, verifyUrl} = params;

    if(!isValidHttpUrl(verifyUrl)) {
        res.status(400).send(`Not valid url entered for 'verifyUrl': ${verifyUrl || "Null"}`);
        return;
    }


    if(!isValidHttpUrl(cancelUrl)) {
        res.status(400).send(`Not valid url entered for 'cancelUrl': ${cancelUrl || "Null"}`);
        return;
    }

    Model.create(params, (err, data) => {
        if(!!err) next(err);
        else {
            const {_id: invoiceNo, createdAt, amount, orderNumber, cur} = data || {_id: "NA"};
            res.json({status: 1, data: {invoiceNo, createdAt, amount, cur, orderNumber}})
        }
    });
}

module.exports = {
    create, updateById, getById, doPayment, checkPayment,
};


