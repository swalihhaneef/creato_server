const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    profilePic:{
        type:String,
    },
    cover_photo:{
        type:String
    },
    mobile:{
        type:Number,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    followers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        }
    ],
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
    saved_post:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'posts'
    }],
    recent_search:{
        type:String
    },
    is_restricted:{
        type:Boolean,
        default:false
    },
    is_admin:{
        type:Boolean,
        default:false
    }
})
const userModel = mongoose.model('Users',UserSchema)
module.exports = userModel