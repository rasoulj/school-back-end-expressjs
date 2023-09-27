const Model = require('../models/users');
const WalletsModel = require('../models/wallets');
const {getParams, ok, notOk, exec, respFunc, getDocs, getDoc} = require("../../../utils/api_helper");
const {MES, CONFIG, Roles} = require("../../../utils/consts");
const mongoose = require('mongoose');
const {createWid, createOrderNo, stdCustomerNumber} = require("../../../utils/wid");
const bcrypt = require('bcrypt');
const HistModel = require("../models/hist");


const masterUser = {
    "verified": true,
    "referred": true,
    "_id": "62f24f5c9c67a210d010c451",
    "phone": "+989123245394",
    "referPhone": "+989133834091",
    "bid": "61ed96fee0b79e0d8c220d57",
    "aid": "bahbahan",
    "displayName": "Mahmood Esmaeili",
    "address": "-",
    "role": "4-branchCustomer",
    "wid": "0002537753116893",
    "uid": "62f24f5c9c67a210d010c451",
    "createdAt": "2022-08-09T12:13:16.323Z",
    "updatedAt": "2022-08-09T12:13:16.323Z"
};

const branch = {
    "verified": true,
    "referred": true,
    "_id": "61ed96fee0b79e0d8c220d57",
    "aid": "bahbahan",
    "displayName": "اربعین ۱۴۰۱",
    "address": "Tehran, PDR",
    "defCurrency": "irr",
    "status": "active",
    "phone": "+37253131097",
    "role": "BRANCH",
    "validFrom": "2022-01-23T04:30:19.222Z",
    "validTo": "2022-01-23T16:30:19.222Z",
    "logged_uid": "61e5cbd632d1ab1d6c0ff2b8",
    "wid": "0002537753116198",
    "uid": "61ed96fee0b79e0d8c220d57",
    "createdAt": "2022-01-23T17:57:18.860Z",
    "updatedAt": "2022-05-18T12:31:32.012Z"
};

const {uid: MASTER_UID, bid} = masterUser;


function createOtp(digits = 5) {
    var max = 1;
    for(var i=0; i<digits-1; i++) max *= 10;
    return Math.floor(Math.random() * (9*max)) + max;
}

async function setOtp(req, res, next) {
    const {logged_uid: uid} = getParams(req);
    if(!uid) {
        res.status(400).send(notOk("User not logged"));
        return;
    }
    const otp = createOtp();

    try {
        const {updatedAt} = await Model.findOneAndUpdate({uid}, {otp}).lean().exec();
        res.status(200).send(ok({otp, updatedAt}));
    } catch (e) {
        res.status(500).send(notOk("An error occurred."));
    }
}

async function changePassword(req, res, next) {
    const {logged_uid: uid} = req.body;
    const {curPassword, newPassword} = getParams(req);

    console.log("curPassword, newPassword, uid", curPassword, newPassword, uid);

    await Model.findOne({uid}, "password", async (e1, user) => {
       console.log(e1, user);
        if(e1) next(e1);
       else {
           if(!!user && bcrypt.compareSync(curPassword, user.password)) {
               await Model.findOneAndUpdate({uid}, {
                   password: bcrypt.hashSync(newPassword, 10)
               }, respFunc(res, next, "Password has been updated"));
           } else res.status(400).send(notOk("Current Password is not valid"));
        }
    });

}

async function save(req, res, next) {
    const params = getParams(req);

    console.log(params);

    const {role, aid, bid} = params;

    let {uid} = params;

    if(role === Roles.NONE) {
        res.status(400).send("Role '5-none' is not valid");
        return;
    }
    else if([Roles.CUSTOMER, Roles.BRANCH_AGENT, Roles.BRANCH_ADMIN].includes(role)) {
        if(!bid || !aid) {
            res.status(400).send("Both bid and aid must be entered to Create this User");
            return;
        }
    } else if([Roles.AGENCY_ADMIN, Roles.BRANCH].includes(role)) {
        if(!aid) {
            res.status(400).send("'aid' must be entered to Create this User");
            return;
        }
    } else if(Roles.AGENCY === role) {
        if(!uid) {
            res.status(400).send("'uid' must be entered to Create this User");
            return;
        }
    }

    // if(Roles.AGENCY !== role && !!uid) {
    //     res.status(500).send("'uid' cannot be entered to create such user");
    //     return;
    // }

    if(!uid || Roles.AGENCY === role) {
        if(!uid) uid = mongoose.Types.ObjectId();
        const wid = await createWid();
        let doc = {...params, wid, uid};
        if(Roles.AGENCY !== role) doc._id = uid;
        await WalletsModel.create({wid, usd: 0}, async (err, data) => {
           if(err) next(err);
           else await Model.create(doc, respFunc(res, next, MES.User_Added));
        });

    } else await Model.findOneAndUpdate({uid}, params, respFunc(res, next, "User has been updated"));
}



// function findByEmail(req, res, next) {
//     const q = Model.find(getParams(req, 'email'));
//     exec(q, res, next);
// }

function findById(req, res, next) {
    const q = Model.findOne({uid: req.params.uid}, "-password -__v");
    exec(q, res, next);
}

/*
  factory Wallet.fromJson(Json json) => Wallet(
    iqd: getDoubleField(json, "iqd"),
    usd: getDoubleField(json, "usd"),
    aed: getDoubleField(json, "aed"),
    eur: getDoubleField(json, "eur"),
    cny: getDoubleField(json, "cny"),
    irr: getDoubleField(json, "irr"),
    gbp: getDoubleField(json, "gbp"),
    aud: getDoubleField(json, "aud"),
    cad: getDoubleField(json, "cad"),
  );

 */

function normalWallet(wallet) {
    const {
        iqd = 0,
        usd = 0,
        aed = 0,
        eur = 0,
        cny = 0,
        irr = 0,
        gbp = 0,
        aud = 0,
        cad = 0,
    } = wallet || {};
    return {iqd, usd, aed, eur, cny, irr, gbp, aud, cad}
}

function getOrder(cur, amount, user) {
    const {wid} = user;
    return {
        type: "transfer",
        amount,
        cur,
        cwid: stdCustomerNumber(masterUser.wid),
        fee: 0,
        wid,
        obid: bid,
        obranch: branch,
        branch,
        transactions: [
            {
                amount: -amount,
                wid: masterUser.wid,
                cur,
                desc: `Transferred to ${wid}`,
                type: "transfer",
                owid: wid,
                fee: 0,
                bid,
            },
            {
                amount,
                wid,
                cur,
                desc: `Transferred to ${wid}`,
                type: "transfer",
                owid: masterUser.wid,
                fee: 0,
                bid
            }
        ],
        ...user,
        "orderNo": createOrderNo(),
        "status": "accepted",
    };
}


async function doOrder(order) {
    const {transactions} = order;
    const histDocs = [];

    for (const transaction of transactions) {
        const {bid, wid, amount, cur, desc, type, ocur = "", oAmount = 0.0, cwid = "", fee = 0.0, owid} = transaction;
        if (wid && wid.length > 0) {
            await WalletsModel.update({wid}, {$inc: {[cur]: amount}});

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
    return histDocs;

    // console.log(histDocs);

}


async function putBalanceByPhone(req, res, next) {
    try {
        const {logged_uid} = req.body;
        if(logged_uid !== MASTER_UID) {
            res.status(403).send("Not Authorized.");
            return;
        }
        const {phone, aid} = req.params;
        Model.findOne({phone, aid}, async (euser, duser) => {
            if(!!euser) res.send(notOk(euser));
            else {
                if(!duser) {
                    res.status(404).send("User not found");
                } else {
                    const user = getDoc(duser);
                    const {cur, amount: am} = getParams(req, "cur amount") || {};

                    const amount = am*1.0;

                    if(!CURS.includes(cur)) {
                        res.status(400).send("Invalid Currency");
                        return;
                    }

                    if(!(amount > 0)) {
                        res.status(400).send("Invalid Amount");
                        return;
                    }

                    const order = getOrder(cur, amount, user);
                    const histDocs = await doOrder(order);
                    await HistModel.insertMany(histDocs, respFunc(res, next, "Done"));
                }
            }
        });
    } catch (e) {
        res.status(500).send(e.message);
    }
}
async function getBalanceByPhone(req, res, next) {
    try {
        const {logged_uid} = req.body;
        if(logged_uid !== MASTER_UID) {
            res.status(403).send("Not Authorized.");
            return;
        }
        const {phone, aid} = req.params;
        Model.findOne({phone, aid}, (euser, duser) => {
            if(!!euser) res.send(notOk(euser));
            else {
                if(!duser) {
                    res.status(404).send("User not found");
                } else {
                    const {wid} = getDoc(duser);
                    WalletsModel.findOne({wid}, (ewallet, wallet) => {
                        if(ewallet) res.send(notOk(ewallet));
                        res.send(ok(normalWallet(getDoc(wallet))));
                    })
                }
            }
        })
    } catch (e) {
        res.status(500).send(e.message);
    }
}

async function getUserByPhone(req, res, next) {
    try {
        const {logged_uid} = req.body;
        if(logged_uid !== MASTER_UID) {
            res.status(403).send("Not Authorized.");
            return;
        }
        const {phone, aid} = req.params;
        Model.findOne({phone, aid}, (euser, duser) => {
            if(!!euser) res.send(notOk(euser));
            else {
                if(!duser) {
                    res.status(404).send("User not found");
                } else {
                    const {displayName, address, phone, wid, uid, } = getDoc(duser);
                    res.send(ok({displayName, address, phone, wid, uid, }));
                }
            }
        })
    } catch (e) {
        res.status(500).send(e.message);
    }
}

async function getBalance(req, res, next) {
    try {
        const {logged_uid: uid} = req.body;
        await Model.findById(uid, (euser, user) => {
            if(euser) res.send(notOk(euser));
            else {
                const {wid} = getDoc(user) || {};
                console.log("logged_uid", uid, wid);
                WalletsModel.findOne({wid}, (ewallet, wallet) => {
                    if(ewallet) res.send(notOk(ewallet));
                    res.send(ok(normalWallet(getDoc(wallet))));
                })
            }
        });
    } catch (e) {
        res.send(notOk(e.message));
    }
}


const CURS = ["iqd", "usd", "aed", "eur", "cny", "irr", "gbp", "aud", "cad"];
function getWallet(wallet) {
    if(!wallet) return {};
    let w = {};
    for(const cur of CURS) {
        if(wallet.hasOwnProperty(cur)) {
            const val = 1*wallet[cur];
            if(!isNaN(val)) w[cur] = val
        }
    }
    return w;
}

async function putBalance(req, res, next) {
    try {
        const {
            logged_uid: uid,
        } = req.body;
        const wallet = getWallet(req.body);

        await Model.findById(uid, (euser, user) => {
            if(euser) res.send(notOk(euser));
            else {
                const {wid} = getDoc(user) || {};
                WalletsModel.findOneAndUpdate({wid}, wallet, {upsert: true}, (ewallet, result) => {
                    if(ewallet) res.send(notOk(ewallet));
                    res.send(ok(wallet,"Wallet updated successfully"));
                })
            }
        });
    } catch (e) {
        res.send(notOk(e.message));
    }
}

function findByIdAndUpdate(req, res, next) {
    const q = Model.findOneAndUpdate({uid: req.params.uid}, getParams(req));
    exec(q, res, next);
}

function all(req, res, next) {
    const {limit, wids} = req.query;
    let options = null;
    if(limit) {
        delete req.query.limit;
        options = {limit: 1*limit};
    }

    let query = req.query || {};
    if(wids) {
        delete req.query.wids;
        query = {...query, wid: {$in: wids.split(",")}}
    }

    console.log("query", query);


    const q = Model.find(query, "-__v", options);
    exec(q, res, next);
}

function deleteById(req, res, next) {
    const q = Model.findByIdAndRemove(req.params.id);
    exec(q, res, next);
}


module.exports = {
    changePassword,
    save,
    all,
    deleteById,
    findById,
    findByIdAndUpdate,
    setOtp,
    createOtp,
    getBalance,
    getBalanceByPhone,
    putBalance,
    getUserByPhone,
    putBalanceByPhone,
};

/*
      "wid": "0002537753113578"
      "wid": "0002537753113593"
      "wid": "0002537753113601"
      "wid": "0002537753113613"
      "wid": "0002537753113649"
      "wid": "0002537753113664"
      "wid": "0002537753113676"
      "wid": "0002537753113688"
      "wid": "0002537753113691"
      "wid": "0002537753113723"
      "wid": "0002537753113735"
 */

/*

[{"amount": -220, "bid": "606dbd26c5e7d006c8b058f5", "cur": "iqd", "desc": "Transferred to 0002-5377-5311-3664", "fee": 11, "hasDone": true, "owid": "0002-5377-5311-3664", "type": "transfer", "wid": "0002537753113664"}, {"amount": -11, "bid": "606dbd26c5e7d006c8b058f5", "cur": "iqd", "desc": "For Transaction fee", "fee": 11, "hasDone": true, "owid": "0002-5377-5311-3664", "type": "fee", "wid": "0002537753113664"}, {"amount": 11, "bid": "606dbd26c5e7d006c8b058f5", "cur": "iqd", "desc": "Transaction fee from 0002-5377-5311-3664", "owid": "0002-5377-5311-3664", "type": "fee", "wid": "0002537753113649"}, {"amount": 220, "bid": "606dbd26c5e7d006c8b058f5", "cur": "iqd", "desc": "Transferred from 0002-5377-5311-3664", "fee": 11, "owid": "0002537753113664", "type": "transfer", "wid": "0002537753113664"}]
 */
