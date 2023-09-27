const Model = require('../models/definitions');
const {getParams, ok, notOk, exec, respFunc} = require("../../../utils/api_helper");
const {MES, CONFIG} = require("../../../utils/consts");

const readXlsxFile = require('read-excel-file/node');

const fs = require("fs");

function getTermDef(fileName = "data/defs.txt") {
    let td = [];
    try {
        const data = fs.readFileSync(fileName, 'utf8').toString();
        const lines = data.split('\r\n');
        for (const line of lines) {
            const t = line.split("\t");
            if (t.length !== 3) continue;
            td.push({C: 1 * t[0], T: 1 * t[1], D: t[2]})
        }
    } catch (e) {
        console.log('Error:', e.stack);
    } finally {

    }
    return td;
}

function tIsUnique(all) {
    all.sort((a, b) => a.T - b.T);
    for (let i = 0; i < all.length - 1; i++) {
        if (all[i].T === all[i + 1].T) return false;
    }
    return true;
}

function initAll(req, res, next) {
    const {email, password} = getParams(req, "email password");

    if (email !== 'rasoulj@gmail.com' && password !== "<123salaam/>") res.json(notOk("Invalid username."));

    Model.remove({}, function (err, data) {
        if (err) res.json(notOk(err.message));
        else {
            readXlsxFile('data/defs.xlsx').then((rows) => {
                let all = [];
                for (const row of rows) {
                    if (row.length !== 3 || (typeof row[0]) !== 'number' || (typeof row[1]) !== 'number') continue;
                    all.push({C: row[0], T: row[1], D: row[2]})
                }
                if (true && tIsUnique(all)) {
                    Model.insertMany(all, function (err2, data2) {
                        if (err2) res.json(notOk(err2.message));
                        else res.json(ok(undefined, `All done, ${all.length} definition items has been added.`));
                    });
                } else res.json(notOk("T values is not unique"));
            }).catch(function (err3) {
                res.json(notOk("Error reading excel file."))
            });
        }
    });

}

function getCategory(req, res, next) {
    const {category} = req.params;
    console.log("Cat", category);
    const q = Model.find({C: category}, "T D -_id");
    exec(q, res, next);
}

module.exports = {
    initAll,
    getCategory
};
