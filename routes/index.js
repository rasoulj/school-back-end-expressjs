const rgen = require("./rgen");
const cgen = require('../app/api/controllers/cgen');

module.exports = {
    auth: require("./auth"),
    agencies: require("./agencies"),
    // actors: rgen(cgen(require("../app/api/models/actors"), 'name age')),
    // movies: rgen(require("../app/api/controllers/movies")),
    users: require("./users"),
    sms: require("./sms"),
    wallets: require("./wallets"),
    rates: rgen(require("../app/api/controllers/rates")),
    aid_rates: require("./aid_rates"),
    hist: rgen(require("../app/api/controllers/hist")),
    atickets: rgen(require("../app/api/controllers/atickets")),
    orders: require("./orders"),
    fees: rgen(require("../app/api/controllers/fees")),
    topics: require("./topics"),
    invoice: require("./invoices"),
    gateway: require("./gateway"),
    word: require("./word"),
    wuser: require("./wusers"),
    // definitions: require("./definitions"),
    // memberships: rgen(cgen(require("../app/api/models/memberships"), undefined))
};
