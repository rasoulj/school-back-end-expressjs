const mongoose = require('mongoose');

//Define a schema
const Schema = mongoose.Schema;

const ISchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: false
    },
    age: Schema.Types.Number
});


module.exports = mongoose.model('Actor', ISchema);
