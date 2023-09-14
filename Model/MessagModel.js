const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
    {
        sender : {
            type:mongoose.Schema.Types.ObjectId,
            ref : 'Users'
        },
        content : {
            type :String,
            trim : true
        },
        chat :{
            type : mongoose.Schema.Types.ObjectId,
            ref:'Chat'
        }
    },
    {
        timestamp : true
    }
)

const MessageModel = mongoose.model('Message',messageSchema)
module.exports = MessageModel