const jwt = require('jsonwebtoken')
const env = require('dotenv').config()
const generateToken = (user)=>{
    
    return jwt.sign({
        _id:user._id,
        username:user.username,
        email:user.email,
        mobile:user.mobile,
        password:user.password,
        admin:user.is_admin
    },process.env.SecretKey)
}
const verify = async(req,res,next)=>{
    try {
        const token = req.header('Authorization')
        
        if(token){
            const verifyed = jwt.verify(token,process.env.SecretKey)
            req.user = verifyed
           
            next()
            
        }else{
            res.json({success:false})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false})
    }
}

module.exports ={
    generateToken,
    verify
}