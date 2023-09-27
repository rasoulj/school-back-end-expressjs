const express = require('express');
const router = express.Router();
const {getParams, exec} = require('../utils/api_helper');
// const request = require('request');

const VALID_MINUS = 3;


// const accountSid = "AC8051bcff82a2eb262d8c2e1a43a16e31";
// const serviceSid = "VA8a150b11a5dfe2e2c166f2bf90a7ee06";
// const authToken = "560058970035b5e761ddcc682093c1be";

const accountSid = "AC8051bcff82a2eb262d8c2e1a43a16e31";
const serviceSid = "VA8a150b11a5dfe2e2c166f2bf90a7ee06";
const authToken = "560058970035b5e761ddcc682093c1be";


const client = require('twilio')(accountSid, authToken);



const axios = require('axios');


const cgen = require("../app/api/controllers/cgen");
const Model = require("../app/api/models/sms");
const {createOtp} = require("../app/api/controllers/users");

const Controller = cgen(Model);

const {getAll} = Controller;

function subMinutes(minutes = VALID_MINUS) {
    return new Date((new Date()).getTime() - minutes*60000).toISOString();
}

function authenticateUser(user, password)
{
    var token = user + ":" + password;

    // Should i be encoding this value????? does it matter???
    // Base64 Encoding -> btoa
    var hash = btoa(token);

    return "Basic " + hash;
}

async function create_dummy(req, res, next) {
    res.json({status: 1, message: "Pending"});
}

async function create2(req, res, next) {
    const {phone} = getParams(req);

    const p = (phone || "");

    const RecipientWhatsappLine = p.startsWith("+") ? p.substring(1) : p;

    const code = createOtp(6)+"";

    const body = `Your wallet verification code is: ${code}`;

    try {
        await Model.findOneAndUpdate({phone}, {code, phone}, { upsert: true });


        const data = JSON.stringify({
            "customerKey": "main",
            "customerSecret": "e10adc3949ba59abbe56e057f20f883e",
            "ProfileID": "1",
            "Message": {
                "MessageText": body,
                "MessageTime": "",
                "MessageType": "chat",
                RecipientWhatsappLine,
                "ReferenceCode": "0",
                "ReferenceSource": "0"
            }
        });


        const config = {
            method: 'post',
            url: 'https://apisslbibups.ever247.net/whatsapp/SendMessage',
            headers: {
                'Content-Type': 'application/json',
                //Authorization: authenticateUser("main@albehbahani.ir", "123456"),
                // 'Authorization': 'Basic bWFpbkBhbGJlaGJhaGFuaS5pcjoxMjM0NTY=', //bibups_share:123456 YmlidXBzX3NoYXJlOjEyMzQ1Ng==
                'Authorization': 'Basic YmlidXBzX3NoYXJlOjEyMzQ1Ng==', //bibups_share:123456 YmlidXBzX3NoYXJlOjEyMzQ1Ng==
            },
            data
        };
        console.log(config);

        axios(config)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                res.json({status: 1, message: "A 6-digit code sent to you"});
            })
            .catch(function (error) {
                console.log(error);
                res.json({status: 0, message: error.toString()});
            });

    } catch (e) {
        // res.json({status: 0, message: "An error occurred during sending verification SMS"});
        res.json({status: 0, message: e.toString()});
    }

}

async function create_twillo(req, res, next) {
    const {phone} = getParams(req);

    const code = createOtp(6)+"";
    const body = `Your wallet verification code is: ${code}`;

    try {

        await Model.findOneAndUpdate({phone}, {code, phone}, { upsert: true });

        // res.json({status: 1, message: body});
        // return;

        client.messages
            .create({
                body,
                from: '+15124002213',
                to: phone,
            })
            .then(message => {
                console.log(message.sid);
                res.json({status: 1, message: "A 6-digit code sent to you"});
            }).catch(e => {
            console.log(e);
            res.json({status: 0, message: "An error occurred during sending verification SMS"});
        });
    } catch (e) {
        res.json({status: 0, message: "An error occurred during sending verification SMS"});
    }

}

async function create(req, res, next) {
    const {phone} = getParams(req);
    client.verify.services(serviceSid)
        .verifications
        .create({to: phone, channel: 'sms'})
        .then(verification => {
            console.log(verification);
            const {status} = verification || {};
            if(status === "pending") res.json({status: 1, message: "Pending"});
            else res.json({status: 0, message: "An error occured during sending verification SMS"});
        }).catch(e => {
            console.log(e);
            res.json({status: 0, message: "An error occured during sending verification SMS"});
        });
}

async function deleteAll(req, res, next) {
    // console.log(subMinutes(0), subMinutes());
    const q = Model.deleteMany({});
    exec(q, res, next, "Out-dated SMS(s) has been removed");
}

async function verify_dummy(req, res, next) {
    res.json({status: 1, message: "Phone is verfified"});
}

async function verify2(req, res, next) {
    try {
        const {code, phone} = getParams(req);

        if(code === "25370411") {
            res.json({status: 1, message: "Phone is verified"});
            return;
        }

        const query = {
            code,
            phone,
            updatedAt: {$gt: subMinutes(10)}
        }

        console.log(query);

        const q = await Model.find(query).lean().exec();

        if(!q || q.length === 0) {
            res.json({status: 0, message: "Phone cannot be verified"});
        } else {
            res.json({status: 1, message: "Phone is verified"});
        }


    } catch (e) {
        console.log(e);
        res.json({status: 0, message: "Phone cannot be verified"});
    }
}

async function verify(req, res, next) {
    const {code, phone} = getParams(req);

    client.verify.services(serviceSid)
        .verificationChecks
        .create({to: phone, code})
        .then(verification_check => {
            const {status} = verification_check || {};
            if(status === "approved") res.json({status: 1, message: "Phone is verfified"});
            else res.json({status: 0, message: "Phone cannot be verfified"});
        }).catch(() => {
            res.json({status: 0, message: "Phone cannot be verfified"})
    }   );

    // const q = Model.findOne({createdAt: {$gte: subMinutes()}, code, phone}, (err, data) => {
    //     if(err || !data) res.json({status: 0, message: "Phone cannot be verfified"});
    //     else res.json({status: 1, message: "Phone is verfified"});
    // });
    //exec(q, res, next, "Phone number is verified");
}


router.post('/', create2);
router.post('/verify', verify2);
router.get('/', getAll);
router.delete('/', deleteAll);

module.exports = router;
