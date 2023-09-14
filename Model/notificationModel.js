const mongoose = require('mongoose')

const notifySchema = new mongoose.Schema({
    reciepients:  {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    time: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    postId:{
        type: mongoose.Schema.Types.ObjectId,
        
        ref: 'posts'
    },
    url: String,
    text: String,
    content: String,
    image: String,
    isRead: {
        type: Boolean,
        default: false
    },

    


})
const notifymodel = mongoose.model('notification', notifySchema)
module.exports = notifymodel