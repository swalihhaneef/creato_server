const mongoose = require('mongoose')

const chatModel = new mongoose.Schema({
    chatName: {
        type: String,
        trim: true
    },
    isGroupChat: {
        type: Boolean,
        default: false
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }
    ],
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },  
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    }
}, {
    timestamps: true
})
const chat = mongoose.model('Chat',chatModel)

module.exports = chat