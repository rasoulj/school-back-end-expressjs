const success = 1;
const fail = 0;

function getResp(status, data, message = undefined, debug = undefined) {
    return {status, data, message, debug}
}

function respFunc(res, next, message) {
    return function (err, data) {
        if(err) next(err);
        else res.json(getResp(success, data, message))
    }
}

function ok(data, message, debug) {
    return getResp(success, data, message, debug)
}

function notOk(message, data, debug) {
    return getResp(fail, data, message, debug)
}

function getParams(req, params) {
    const ob = {};
    const {body} = req;
    if(!params) return body;
    for(const f of params.split(' ')) {
        ob[f] = body[f] === undefined ? undefined : body[f];
    }
    return ob;
}

function exec(q, res, next, message) {
    q.exec(respFunc(res, next, message))
}

function getDocs(docs) {
    if(!docs) return [];
    return docs.map(p => p._doc);
}

function getDoc(doc, defValue = {}) {
    if(!doc) return defValue;
    return doc._doc;
}


module.exports = {
    success, fail,
    ok,
    notOk,
    getParams,
    exec,
    respFunc,
    getDocs,
    getDoc
};
