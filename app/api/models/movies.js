const mongoose = require('mongoose');

//Define a schema
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
	name: {
		type: String,
		trim: true,
		required: true
	},
	released_on: {
		type: Date,
		trim: true,
		required: true
	},

	actors: [{ type: Schema.Types.ObjectId, ref: 'Actor' }]
    //actors: [ActorSchema]
});

module.exports = mongoose.model('Movie', MovieSchema);
