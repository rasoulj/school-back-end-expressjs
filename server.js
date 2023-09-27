const express = require('express');
const logger = require('morgan');

var cors = require('cors');

const {
    users,
    agencies,
    rates,
    fees,
    wallets,
    auth,
    orders,
    hist,
    sms,
    atickets,
    topics,
    invoice,
    gateway,
    word,
    wuser,
    aid_rates,
} = require('./routes');

const bodyParser = require('body-parser');
const mongoose = require('./config/database'); //database configuration
const jwt = require('jsonwebtoken');
const app = express();

app.use(cors());

const {notOk} = require('./utils/api_helper');

app.set('secretKey', 'nodeRestApi'); // jwt secret token

// connection to mongodb
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));



//handle static contents
app.use('/static', express.static('public'));

app.use(logger('dev'));
//app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.json(notOk());
});

/*
// public route
app.use('/users', users);

// private route
app.use('/movies', validateUser, movies);
app.use('/actors', validateUser, actors);
*/

addRoutes({
    agencies,
    auth,
    sms,
    t_users: users,
    t_wallets: wallets,
    gateway,
    word,
    wuser,
    aid_rates,
}, {
    atickets,
    users,
    rates,
    fees,
    wallets,
    orders,
    hist,
    topics,
    invoice,
});

app.get('/favicon.ico', function (req, res) {
    res.sendStatus(204);
});

function addRoutes(publicRoutes, privateRoutes) {
    for(const p of Object.keys(publicRoutes)) app.use(`/${p}`, publicRoutes[p]);
    for(const p of Object.keys(privateRoutes)) app.use(`/${p}`, validateUser, privateRoutes[p]);
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

    jwt.verify(req.headers['x-access-token'], req.app.get('secretKey'), function (err, decoded) {
        console.log("err, decoded", err, decoded);
        if (err) {
            res.json(notOk("User do not logged-in"));// {status: "error", message: err.message, data: null});
        } else {
            // add user id to request
            // console.log(decoded);
            req.body.logged_uid = decoded.id;
            next();
        }
    });

}

function validateUserDummy(req, res, next) {
    req.body.logged_uid = "606dbda5c5e7d006c8b058f7"; // "606cd8cbe8f39a43a40ee9b4"; //
    next();
}


// express doesn't consider not found 404 as an error so we need to handle 404 it explicitly
// handle 404 error
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// handle errors
app.use(function (err, req, res, next) {
    console.log(err);

    if (err.status === 404)
        res.status(404).json(notOk('Not found'));// {message: "Not found", status: fail});
    else {
        console.log(err);
        res.status(500).json(notOk(err.message));
    }

});

app.listen(2537, function () {
    console.log('Node server listening on port 2537');
});
