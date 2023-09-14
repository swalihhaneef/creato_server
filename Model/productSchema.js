const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    discription:{
        type:String,
        require:true
    },
    title:{
        type:String,
        require:true
    },
    post:{
        type:String,
        
    },
    time:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref : 'Users'
    },
   
   price:{
    type:Number,
    require:true
   },
   category:{
    type:String,
    require:true
   },
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
    is_restricted:{
        type:Boolean,
        default:false
    },

})
const productModel = mongoose.model('products',productSchema)
module.exports = productModel