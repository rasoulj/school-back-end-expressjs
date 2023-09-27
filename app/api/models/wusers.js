const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const Schema = mongoose.Schema;

//db.users.createIndex( { "aid": 1, "phone": 1 }, { unique: true } )

const ISchema = new Schema({
    // uid: {
    //     type: String,
    //     trim: true,
    //     required: true,
    //     unique: true
    // },
    userName: {
        type: String,
        trim: true,
        required: true
    },
    phone: {
        type: String,
        trim: true,
        required: false,
        // unique: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
}, {strict: false});

ISchema.index({ userName: 1 }, { unique: true });

ISchema.set("timestamps", true);

ISchema.pre('save', async function (next) {
    this.password = bcrypt.hashSync(this.password, saltRounds);
    // this.wid =  createWid(await nextCount("wid"));
    next();
});

module.exports = mongoose.model('WordUsers', ISchema);

// module.exports = createWid;
