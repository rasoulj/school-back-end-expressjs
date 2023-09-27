const mongoose = require('mongoose');
//Define a schema
const Schema = mongoose.Schema;


const SchoolSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    address: {
        type: String,
        trim: true,
        required: false
    },
    type: Schema.Types.Number,
    schoolTag: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    users: [{type: Schema.Types.ObjectId, ref: 'User'}],
    classRooms: [{type: Schema.Types.ObjectId, ref: 'ClassRoom'}],
});


module.exports = mongoose.model('School', SchoolSchema);
