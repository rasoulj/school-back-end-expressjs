const mongoose = require('mongoose');

//Define a schema
const Schema = mongoose.Schema;

const classRoomSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    status: Schema.Types.Number,
    level: Schema.Types.Number,
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lessons: [{
        weeklyProgram: [Schema.Types.Number],
        course: { type: Schema.Types.ObjectId, ref: 'Course' },
        teacher: { type: Schema.Types.ObjectId, ref: 'User' },
        marks: [{
            name: Schema.Types.String,
            values: [{student: Schema.Types.ObjectId, mark: Schema.Types.Number, note: Schema.Types.String}]
        }],
        presences: [{
            weekNo: Schema.Types.Number,
            programNo: Schema.Types.Number,
            students: [{student: Schema.Types.ObjectId, note: Schema.Types.String}]
        }]
    }]

});


module.exports = mongoose.model('ClassRoom', classRoomSchema);
