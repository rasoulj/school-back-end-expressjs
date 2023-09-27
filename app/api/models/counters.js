const mongoose = require('mongoose');

//Define a schema
const Schema = mongoose.Schema;

const ISchema = new Schema({
    _id: {
        type: String,
        trim: true,
        required: true,
    },
    value: {
        type: Schema.Types.Number,
        required: true,
    },
});

const Model = mongoose.model('Counters', ISchema);

async function nextCount(_id) {
    try {
        const filter = {_id}, update = { $inc: {value: 1}};
        const doc = await Model.findOneAndUpdate(filter, update, {
            new: true,
            useFindAndModify: true,
        });
        if(!doc) {
            await Model.create({_id, value: 0});
            return 0;
        } else {
            console.log("doc", doc);
            return doc.value;
        }
    } catch (e) {
        console.log(e);
        return -1;
    }
}

module.exports = nextCount;
