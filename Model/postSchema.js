const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    discription: {
        type: String,
        require: true
    },
    post: {
        type: String,

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
    like: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }
    ],
    comment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comments'
    }],
    is_reported: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Users'
            },
            reason: String,  // or other appropriate type
            time: Date
        }
    ],
    is_restricted: {
        type: Boolean,
        default: false
    },

})
const PostModel = mongoose.model('posts', PostSchema)
module.exports = PostModel