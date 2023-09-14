const express = require('express')
const router = express.Router()
const {adminLogin, getUserList, getRepotedPost, getRepotedPostDetails,restrictUser,restrictPost, restrictedPosts, getUserDetails} =require('../Controllers/adminController')
const auth = require('../Middlewere/auth')


router.post('/login',adminLogin)
router.get('/verify',auth.verify)
router.get('/getUserList',auth.verify,getUserList)
router.get('/userDetails',getUserDetails)
router.patch('/restrictUser',restrictUser)
router.get('/reportedPosts',auth.verify,getRepotedPost)
router.get('/getPostDetails',getRepotedPostDetails)
router.patch('/restrictPost',restrictPost)
router.get('/getRestrictedPost',auth.verify,restrictedPosts)
module.exports = router