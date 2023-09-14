const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
    },
    like:{
        type:Array
    },
    reply:[{
        content:String,
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        time:Date
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    time: {
        type: Date
    }    
})

const commentModel = mongoose.model('comments',commentSchema)

module.exports = commentModel