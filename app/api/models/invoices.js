const mongoose = require('mongoose');

//Define a schema
const Schema = mongoose.Schema;

const ISchema = new Schema({
    // logged_uid: Schema.Types.ObjectId,
    invoiceStatus: {
        type: String,
        trim: true,
        required: true,
        default: 'ISSUED',
        enum : ['ISSUED', 'PAYED', 'CANCELED', 'ERROR']
    },
    cur: {
        type: String,
        trim: true,
        required: true,
        default: 'usd',
        enum : ['irr', 'usd', 'iqd']
    },
    amount: {
        type: Schema.Types.Number,
        required: true
    },
    orderNumber: {
        type: String,
        trim: true,
        required: true,
        default: '',
    },
    verifyUrl: {
        type: String,
        trim: true,
        required: true
    },
    cancelUrl: {
        type: String,
        trim: true,
        required: true
    },
}, {
    strict: false,
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true },
});

ISchema.set("timestamps", true);

ISchema.virtual('owner', {
    ref: 'Users', // The model to use
    localField: 'logged_uid', // Find people where `localField`
    foreignField: 'uid', // is equal to `foreignField`
    // If `justOne` is true, 'members' will be a single doc as opposed to
    // an array. `justOne` is false by default.
    justOne: true,
    // options: { sort: { name: -1 }, limit: 5 } // Query options, see http://bit.ly/mongoose-query-options
});


module.exports = mongoose.model('Invoices', ISchema);
