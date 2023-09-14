const mongoose = require('mongoose')
const StatusModel = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    photo: {
        type: String,
    },
    time: {
        type: Date, // Store the time as a Date object
        expires: 60 * 60 * 24, // 24 hours (in seconds)
        default: Date.now // Set the default value to the current time
    }
});

const status = mongoose.model('status', StatusModel);


module.exports = status;
