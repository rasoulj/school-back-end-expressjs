const mongoose = require('mongoose');

//Define a schema
const Schema = mongoose.Schema;

const ISchema = new Schema({
}, {strict: false});

ISchema.set("timestamps", true);

module.exports = mongoose.model('Orders', ISchema);
