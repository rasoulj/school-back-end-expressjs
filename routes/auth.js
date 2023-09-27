const {getParams, ok, notOk, exec, respFunc, getDocs, getDoc} = require("../utils/api_helper");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {MES, CONFIG, Roles} = require("../utils/consts");
const {save} = require("../app/api/controllers/users");

const express = require('express');
const router = express.Router();
const Model = require('../app/api/models/users');


function authenticate(req, res, next) {
    const {phone, aid, password} = getParams(req, "phone aid password");
    console.log("phone, aid, password", phone, aid, password);
    Model.findOne({phone, aid}, "-__v", function (err, user) {
        if (err) next(err);
        else {
            //console.log(userInfo.password);
            try {
                if (user != null && bcrypt.compareSync(password, user.password)) {
                    const token = jwt.sign({id: user._id}, req.app.get('secretKey'), {expiresIn: CONFIG.TokenExpireIn});
                    user.password = undefined;

                    // console.log("Salaam");
                    // console.log(user);

                    let {uid, aid, bid, role, referPhone, referred} = getDoc(user);
                    if(!bid) bid = uid;

                    if(role === Roles.CUSTOMER && !referred) {
                        res.json(notOk(MES.User_Not_Verified));
                        return;
                    }

                    Model.find({uid: [aid, bid]}, "-__v", (errEx, data) => {
                        if(errEx) next(errEx);
                        const all = getDocs(data);
                        console.log(aid, bid, all);
                        const branch = {defCurrency: "usd", ...all.find(p => p.uid === bid)};
                        const agency = all.find(p => p.uid === aid);

                        res.json(ok({
                            user,
                            authToken: token,
                            branch,
                            agency,
                        }));
                    });


                } else {
                    res.json(notOk(MES.Invalid_User_Pass));
                }
            } catch (e) {
                res.json(notOk(e.toString()));
                // console.log(e);
                // res.status(401).send(e.toString());
            }
        }
    });
}

function setPassword(req, res, next) {
    const {phone, aid, password} = getParams(req);
    console.log("phone, aid, password", phone, aid, password);
    Model.findOne({phone, aid}, "-__v", function (err, user) {
        if(err) next(err);
        else if(!user) res.json(notOk("No user"));
        else {
            const {uid} = user;
            Model.findOneAndUpdate({uid}, {
                password: bcrypt.hashSync(password, 10)
            }, respFunc(res, next, "Password has been updated"));
        }
    });
}

function findByPhone(req, res, next) {
    const {query} = req;
    // if(!phone) res.status(400).send("'phone' not specified");
    // else if(!aid) res.status(400).send("'aid' not specified");
    Model.find(query, "-__v -password", function (err, user) {
        if (err) next(err);
        else {
            res.json(ok(user))
        }
    });
}




router.post('/', authenticate);
router.post('/setPassword', setPassword);
router.get('/', findByPhone);
router.put('/', save);


module.exports = router;
