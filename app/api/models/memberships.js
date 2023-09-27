const mongoose = require('mongoose');

//Define a schema
const Schema = mongoose.Schema;

const ISchema = new Schema({
    displayName: {
        type: String,
        trim: true,
        required: true
    },
    owner: {
        type: String,
        trim: true,
        required: true
    },
    pid: {
        type: String,
        trim: true,
        required: true
    },
    updatedAt: {
        type: Date,
        trim: true,
        default: Date.now,
        required: true
    },
    admins: [Schema.Types.String],
    members: [Schema.Types.String],
    subs: [Schema.Types.String],
}, {strict: false});

module.exports = mongoose.model('Memberships', ISchema);
