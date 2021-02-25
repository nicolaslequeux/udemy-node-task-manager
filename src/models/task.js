const mongoose = require('mongoose')

// V1 : MODELE WITHOUT SCHEMA
// const Task = mongoose.model('Task', {
//     description: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     completed: {
//         type: Boolean,
//         default: false
//     },
//     owner: {
//         type: mongoose.SchemaTypes.ObjectId,
//         required: true,
//         ref: 'User'
//     }
// })

// V2: MODELE FROM SCHEMA
const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

// "Task" is the model, mongoose will pluralize the name to create the table "tasks" 
const Task = mongoose.model('Task', taskSchema);

module.exports = Task;