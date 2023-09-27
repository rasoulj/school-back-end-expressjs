const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const Schema = mongoose.Schema;

//db.users.createIndex( { "aid": 1, "phone": 1 }, { unique: true } )

const ISchema = new Schema({
    role: {
        type: String,
        trim: true,
        required: true,
        // default: '5-none',
        enum : ['AGENCY', 'BRANCH', '1-agencyAdmin', '2-branchAdmin', '3-branchAgent', '4-branchCustomer', '5-none']
    },
    uid: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    address: {
        type: String,
        trim: true,
        required: true
    },
    displayName: {
        type: String,
        trim: true,
        required: true
    },
    phone: {
        type: String,
        trim: true,
        required: true,
        // unique: true
    },
    referPhone: {
        type: String,
        trim: true,
    },
    aid: {
        type: String,
        trim: true,
        required: true,
        // unique: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    verified: {
        type: Boolean,
        default: true
    },
    referred: {
        type: Boolean,
        default: true
    }
}, {strict: false});

ISchema.index({ aid: 1, phone: -1 }, { unique: true });

ISchema.set("timestamps", true);

ISchema.pre('save', async function (next) {
    this.password = bcrypt.hashSync(this.password, saltRounds);
    // this.wid =  createWid(await nextCount("wid"));
    next();
});

module.exports = mongoose.model('Users', ISchema);

// module.exports = createWid;
