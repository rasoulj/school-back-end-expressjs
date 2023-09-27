const Model = require('../models/wusers');

const {exec, ok, getParams, getDoc, notOk, getDocs} = require("../../../utils/api_helper");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {MES} = require("../../../utils/consts");
const mongoose = require("mongoose");

const rhino = "کرگدن";

const SCORES = {
    winsScore: 5,
    loseScore: 1,
}

const EMPTY_USER = {
    wins: 0,
    loses: 0,
    index: 0,
    guesses: ["", "", "", "", "", "", "", ],
    bgSound: true,
    effectSound: true,
    correct: rhino,
}

const DEBUG = false;

function validateUser(req, res, next) {
    if(DEBUG) {
        req.body.logged_uid = "614596c0dd986f1be0bd0321"; //Hesam Habibollah
        // req.body.logged_uid = "6115462f30e1fc1abc7f8ab4"; //Rasoul Jafari
        // req.body.logged_uid = "6113746128445706549bd4f1"; //Albehbahani Admin
        next();
        return;
    }

    jwt.verify(req.headers['x-access-token'], req.app.get('secretKey'), async function (err, decoded) {
        console.log("err, decoded", err, decoded);
        if (err) {
            res.json(notOk(err.message));// {status: "error", message: err.message, data: null});
        } else {
            // add user id to request
            // console.log(decoded);
            // req.body.logged_uid = decoded.id;

            const user = await Model.findById(decoded.id);
            req.body.user = getDoc(user);

            next();
        }
    });

}


function register(req, res, next) {
    const user = {...EMPTY_USER, ...getParams(req)};
    const {userName, password} = user;
    try {
        Model.findOne({userName}, "-__v", function (err, d) {
            if(err) next(err);
            else {
                if(!password) {
                    res.json(notOk(MES.User_NoPassword));
                } else if(!d) {
                    Model.create(user, (e, user) => {
                        if(e) next(e);
                        else {
                            delete user.password;
                            res.json(ok(user, MES.User_AddedFa));
                        }
                    });
                } else {
                    res.json(notOk(MES.User_AlreadyAddedFa));
                }
            }
        });
    } catch (e) {
        res.json(notOk(e.toString()));
    }
}

function mergeUsers(user1, user2) {
    const {wins: w1 = 0, loses: l1 = 0} = user1 || EMPTY_USER;
    const {wins: w2 = 0, loses: l2 = 0} = user2 || EMPTY_USER;
    const user = (w1 > w2 || l1 > l2) ? user1 : user2;
    return {...user, wins: w1+w2, loses: l1+l2}
}

function authenticate(req, res, next) {
    const {userName, password} = getParams(req);
    console.log("userName, password", userName, password)
    Model.findOne({userName}, "-__v", async function (err, user) {
        if (err) next(err);
        else {
            try {
                if (user != null && bcrypt.compareSync(password, user.password)) {
                    const token = jwt.sign({id: user._id}, req.app.get('secretKey'), {expiresIn: "72000h"});
                    user.password = undefined;

                    const update = await calcUpdate(getDoc(user));

                    // await Model.findByIdAndUpdate(user._id, newUser, {upsert: true});

                    res.json(ok({
                        update,
                        user,
                        authToken: token,
                    }));
                } else {
                    res.json(notOk(MES.Invalid_User_PassFa));
                }
            } catch (e) {
                console.log(e);
                res.json(notOk(e.toString()));
            }
        }
    });
}

async function getUser(req, res, next) {
    try {
        const {userName} = req.params;

        Model.findOne({userName}, "userName wins loses correct guesses -_id", (e, user) => {
            if(e) res.json(notOk(e));
            else {
                const {f} = req.query

                res.json(!f ? getDoc(user).correct : user);
            }
        })
    } catch (e) {
        res.json(notOk(e.toString()));
    }
}

async function getTops(req, res, next) {
    res.json(ok(await findNearUsers(100000000, 50, false)));
}

async function findUsersAroundScore(score, limit = 10) {
    console.log("findUsersAroundScore", score);
    const gte = (await findNearUsers(score, limit, true)).reverse();
    console.log("gte", gte);
    const count = 2*limit - gte.length;
    const lt = await findNearUsers(score, count, false);
    return [...gte, ...lt];
}


async function findNearUsers(score, limit = 10, gte = true) {
    try {
        const match = !gte ? [
            {$match: {score: {$lt: score}} },
        ] : [
            {$sort: {score: 1}},
            {$match: {score: {$gte: score}} },
        ];
        const q = await Model.aggregate([
            {
                $project: {
                    userName: 1,
                    wins: 1,
                    loses: 1,
                    score: {$add: [{$multiply: ["$wins", SCORES.winsScore]}, {$multiply: ["$loses", SCORES.loseScore]}]}

                }
            },
            {$sort: {score: -1}},
            { $group: {
                    _id: "$name",
                    items: { $push: "$$ROOT" }
                }},
            { $unwind: { path: "$items", "includeArrayIndex": "items.rank" } },
            { $replaceRoot: { "newRoot": "$items" } },
            ...match,
            {$limit: limit}
        ]);
        return q;
    } catch (e) {
        console.log(e);
        return [];
    }
}

function parseReq(req) {
    const body = getParams(req);
    const {user} = body;
    const {_id} = user || {};
    delete body.user;
    return [_id, user, body];
}



async function calcUpdate(user) {
    console.log("user2", user);
    const {wins = 0, loses = 0} = user || EMPTY_USER;
    const score = SCORES.winsScore*wins + SCORES.loseScore*loses;
    try {
        const total = await Model.count({});
        const ranks = await findUsersAroundScore(score, 5);
        return {
            //wins, loses,
            ...SCORES,
            total,
            score,
            ranks,
        };
    } catch (e) {
        console.log("e-calcUpdate", e);
        return {score, wins, loses};
    }
}


function updateUser(req, res, next) {
    const [_id, user, body] = parseReq(req);
    const {wins = 0, loses = 0} = body || EMPTY_USER;

    Model.findByIdAndUpdate(_id, body, {upsert: true}, async (e, d) => {
        if(e) next(e);
        else {
            if(!wins && !loses) {
                res.json(ok({}));
            } else {
                const data = await calcUpdate({wins, loses});
                res.json(ok(data));
            }
        }
    });
}

module.exports = {
    authenticate,
    register,
    validateUser,
    getTops,
    updateUser,
    getUser,
}