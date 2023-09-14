const userModel = require('../Model/UserSchema')
const PostModel = require('../Model/postSchema')
const bcrypt = require('bcrypt')
const { generateToken } = require('../Middlewere/auth')
const { db } = require('../Model/firebase')
const { getDocs, collection, doc, getDoc, query, where, updateDoc } = require('firebase/firestore')
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        let message
        const user = await userModel.findOne({ email: email })
        if (user) {
            console.log(req.body);
            const compare = await bcrypt.compare(password, user.password)
            if (compare) {
                if (user.is_admin) {
                    const token = generateToken(user)

                    res.json({ success: true, token, message: 'loggin successfull' })
                } else {
                    res.json({ success: false, message: 'admin' })
                }
            } else {
                res.json({ success: false, message: 'password doesnt match' })
            }
        } else {
            res.json({ success: false, message: 'you are not an admin' })
        }
    } catch (error) {
        console.log(error);
    }
}
const getUserList = async (req, res) => {
    try {
        const users = await userModel.find({ is_admin: false })
        res.json({ success: true, users })
    } catch (error) {
        res.json({ success: false, error })
    }
}
const getUserDetails = async (req, res) => {
    try {
        const userId = req.query.id
        const user = await userModel.findOne({ _id: userId }).populate('is_reported.userId');
        console.log('User with populated is_reported:', user);
        const post = await PostModel.find({ userId: user._id })

        const followers = user.followers.length
        const followings = user.following.length
        const reportCount = user.is_reported
        res.json({ success: true, followers, followings, reportCount, post, user })


    } catch (error) {
        console.log(error);
        res.json({ success: false, error })
    }
}
const restrictUser = async (req, res) => {
    try {
        const { id } = req.body
        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            { is_restricted: true },
            { new: true } // To return the updated document
        );

        if (updatedUser) {
            console.log('User updated successfully:', updatedUser);
        } else {
            console.log('User not found');
        }
        res.json({ success: true })
    } catch (error) {
        res.json({ success: false, error })
        console.log(error);
    }
}
const getRepotedPost = async (req, res) => {
    try {
        const posts = await PostModel.find({}).populate('userId').populate('comment.userId')
        const reportedPost = posts.filter((item) => item.is_reported.length > 0 && item.is_restricted != true)

        res.json({ success: true, reportedPost })
    } catch (error) {
        res.json({ success: false, error })
    }
}
const getRepotedPostDetails = async (req, res) => {
    try {
        console.log('hereee');
        const postId = req.query.postId;
        const post = await PostModel.findOne({ _id: postId }).populate('userId').populate('comment.userId').populate('is_reported.userId')
        const user = await userModel.findOne({ _id: post.userId })
        const followers = user.followers
        const following = user.following
        // const posts = await PostModel.find({userId:post.userId})
        const reports = post.is_reported

        console.log(reports);
        res.json({ success: true, post, user, followers, following, reports });
    } catch (error) {
        console.log(error);
        res.json({ success: false, error });
    }
}
const restrictPost = async (req, res) => {
    try {
        const { postID } = req.body
        console.log(postID);
        const post = await PostModel.updateOne({ _id: postID }, { is_restricted: true })
        res.json({ success: true })
    } catch (error) {
        res.json({ success: false, error })
    }
}
const restrictedPosts = async (req, res) => {
    try {
        const restrictedPost = await PostModel.find({ is_restricted: true }).populate('userId')
        console.log(restrictedPost);
        res.json({ success: true, restrictedPost })
    } catch (error) {
        res.json({ success: false, error })
    }
}
module.exports = {
    adminLogin,
    getUserList,
    getUserDetails,
    getRepotedPost,
    getRepotedPostDetails,
    restrictUser,
    restrictPost,
    restrictedPosts
}