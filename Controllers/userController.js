const userModel = require('../Model/UserSchema')
const { generateToken } = require('../Middlewere/auth')
const bcrypt = require('bcrypt')
const productModel = require('../Model/productSchema')
const PostModel = require('../Model/postSchema')
const notificationModel = require('../Model/notificationModel')
const messageModels = require('../Model/MessagModel')
const chatModel = require('../Model/chatModel')
const commentModel = require('../Model/commentModel')
let message
const userSignup = async (req, res) => {
    const { username, email, phone, password } = req.body
    const user = await userModel.findOne({ username: username })
    const hashpassword = await bcrypt.hash(password, 10)
    if (!user) {
        userModel.create({
            username: username,
            email: email,
            mobile: phone,
            password: hashpassword
        })
        res.json({ success: true })
    } else {
        res.json({ success: false })
    }
}

const login = async (req, res) => {
    try {
        let message
        const { email, password } = req.body
        const user = await userModel.findOne({ email: email })
        if (!user) {
            message = 'No account with thise email'
            res.json({ success: false, message })
        } else {

            const comparedPassword = await bcrypt.compare(password, user.password)
            if (!comparedPassword) {
                message = 'password doesn"t match'
                res.json({ success: false, message })
            } else {
                console.log(comparedPassword);
                const token = generateToken(user)
                res.cookie('jwt', { token, name: user.username, id: user._id }, {
                    httpOnly: false,
                    maxAge: 6000 * 1000
                }).json({ success: true, token, user: user, id: user._id })
            }
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, error })
    }
}
const googleLogin = async (req, res) => {
    try {
        const { email, username } = req.body
        const user = await userModel.findOne({ email: email })
        if (!user) {

            const newUser = userModel.create({
                username: username,
                email: email,

            })


            const token = generateToken(newUser)
            console.log(token);
            res.cookie('jwt', { token, name: newUser.username, id: user._id }, {
                httpOnly: false,
                maxAge: 6000 * 1000
            }).json({ success: true, token, username: newUser.username, id: user._id })

        } else {
            console.log(user, 'dfisfhf');

            const token = generateToken(user)

            res.cookie('jwt', { token, name: user.username, id: user._id }, {
                httpOnly: false,
                maxAge: 6000 * 1000
            }).json({ success: true, token, username: user.username, id: user._id })
        }
    } catch (error) {

    }

}
const homeView = async (req, res) => {
    try {
        const userId = req.user._id

        const user = await userModel.findOne({ _id: userId }).populate('following')

        const followingUsers = user.following;
        const comment = await commentModel.find({}).populate('reply.userId');

        comment.forEach((commentItem) => {
            const reply = commentItem.reply;
            console.log(reply);
        });

        let posts = await PostModel.find({})
            .populate('userId')
            .populate({
                path: 'comment',
                populate: {
                    path: 'userId',
                    model: 'Users' // Use the correct model name for 'Users'
                }
            });

        // Now execute the population for 'comment.reply'
        posts = await PostModel.populate(posts, {
            path: 'comment.reply',
            populate: {
                path: 'userId',
            },
        });




        const products = await productModel.find({}).limit(2)

        const filteredPosts = posts.filter((post) => {
            return followingUsers.some(followingUser =>
                followingUser._id.equals(post.userId._id)
            );
        });
        const followingArray = user.following;

        const notFollowingUsers = await userModel.find(
            { _id: { $nin: [...followingArray, userId] }, is_admin: false },
            { username: 1 }
        );

        const suggessions = notFollowingUsers.map((user) => ({
            _id: user._id,
            username: user.username,
            profilePic: user.profilePic
        }));


        res.json({ success: true, filteredPosts, suggessions, products })
    } catch (error) {
        res.json({ success: false, error })
        console.log(error);
    }
}
const getNotification = async (req, res) => {
    const userId = req.user._id
    const user = await userModel.findOne({ _id: userId })
    const notification = await notificationModel.find({ reciepients: user._id }).populate('userId').populate('postId')
    if (!notification) {
        res.json({ success: true, notification: 'empty' })
    }
    console.log(notification);
    res.json({ success: true, notification })
}
const editProfilePic = async (req, res) => {
    try {
        const { Newusername, email, mobile, proPic, coverPhot } = req.body
        console.log(proPic, 'here', coverPhot);
        const userId = req.user._id
        const user = await userModel.findOne({ _id: userId })
        const updateduser = await userModel.updateMany(
            {
                _id: user._id
            },
            {
                $set: {
                    profilePic: proPic,
                    username: Newusername,
                    email: email,
                    mobile: mobile,
                    cover_photo: coverPhot
                }
            }
        );

        console.log(user);
        res.json({ success: true, message: 'successfull' })
    } catch (error) {
        res.json({ error, message: 'something went wrong' })
        console.log(error);
    }
}
const suggestedList = async (req, res) => {
    try {
        const userId = req.user._id

        const currentUser = await userModel.findById(userId);
        const followingArray = currentUser.following;

        const notFollowingUsers = await userModel.find(
            { _id: { $nin: [...followingArray, userId] }, is_admin: false },
            { username: 1 }
        );

        const suggessions = notFollowingUsers.map((user) => ({
            _id: user._id,
            username: user.username,
        }));


        res.json({ success: true, suggessions })
    } catch (error) {
        console.log(error);
    }
}
const followHandle = async (req, res) => {
    try {
        const userId = req.user._id
        const { id } = req.body
        const date = new Date();
        const user = await userModel.findOne({ _id: userId })
        await userModel.updateOne({ _id: id }, { $push: { followers: user._id } })
        const other_user = await userModel.findOne({ _id: id })
        const updated = await userModel.updateOne({ _id: userId }, { $push: { following: other_user._id } })
        const notify = await notificationModel.create({
            userId: user._id,
            reciepients: other_user._id,
            content: 'follow',
            time: date
        })
        res.json({ success: true })
    } catch (error) {
        console.log(error);
    }
}
const unfollowHandle = async (req, res) => {
    try {
        const userId = req.user._id
        const { id } = req.body
        const user = await userModel.findOneAndUpdate(
            { _id: userId },
            { $pull: { following: id } },
            { new: true } // Set `new` to true to return the updated document
        );
        res.json({ success: true, message: 'success' })
    } catch (error) {
        res.json({ success: false, error })
    }
}
const getDetails = async (req, res) => {
    try {
        const userId = req.user._id

        const user = await userModel.findOne({ _id: userId }).populate('following')



        const followers = user.followers.length
        const followings = user.following.length
        res.json({ success: true, followers, followings, user })
    } catch (error) {
        console.log(error);
    }
}

const profile = async (req, res) => {
    try {
        const id = req.query.id
        console.log('profile');
        console.log(id);
        const user = await userModel.findOne({ _id: id }).populate({
            path: 'saved_post',
            populate: {
                path: 'comment', // Populate the comments in the saved posts
                populate: {
                    path: 'userId'
                },

            },
        });

        const post = await PostModel.find({ userId: user._id }).populate('comment.userId')

        const followers = user.followers.length
        const followings = user.following.length
        res.json({ success: true, followers, followings, post, user })
    } catch (error) {
        console.log(error);
        res.json({ success: false, error })
    }
}
const savepost = async (req, res) => {
    try {
        const { postid, id } = req.body
        const save = await userModel.findByIdAndUpdate(id, {
            $push: { saved_post: postid }
        })
        let saved = 'saved'
        res.json({ success: true, saved })
    } catch (error) {
        res.json({ success: false, error })
    }
}
const followersList = async (req, res) => {
    try {
        console.log("followersList");
        const userId = req.user._id
        const user = await userModel.findOne({ _id: userId }).populate('followers')
        const followersArray = user.followers

        res.json({ success: true, followersArray })

    } catch (error) {
        console.log(error);
        res.json({ success: false, error })
    }
}
const followingsList = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await userModel.findOne({ _id: userId }).populate('following')
        const followingArray = user.following

        res.json({ success: true, followingArray })
    } catch (error) {
        console.log(error);
        res.json({ success: false, error })
    }
}
const reportUser = async (req, res) => {
    try {
        const userId = req.user._id
        const { id, reason } = req.body
        const User = await userModel.findOne({ _id: userId })
        const currentTime = new Date();
        const report = {
            userId: User._id,
            reason: reason,
            time: currentTime
        }
        console.log(report);
        const user = await userModel.findOne({ _id: id })
        const reportedArray = user.is_reported
        reportedArray.push(report)
        await user.save()
        res.json({ success: true })
    } catch (error) {
        res.json({ success: false, error })
    }
}
const GetProducts = async (req, res) => {
    try {
        const userId = req.user._id
        const products = await productModel.find().populate('userId')
        const user = await userModel.findOne({ _id: userId })
        const filteredProducts = products.filter((item) => item.userId != user._id)
        res.json({ success: true, filteredProducts })
    } catch (error) {
        res.json({ success: false, error })
        console.log(error);
    }
}
const Addproduct = async (req, res) => {
    try {
        console.log(req.body);
        const { title, price, category, description, converTed } = req.body
        const userId = req.user._id
        const user = await userModel.findOne({ _id: userId })
        const currentTime = new Date();
        const newProduct = await productModel.create({
            discription: description,
            post: converTed,
            time: currentTime,
            userId: user._id,
            price: price,
            category: category,
            title: title
        })
        res.json({ success: true, message: 'product added succefully' })
    } catch (error) {
        res.json({ success: false, error })
    }
}
const getChats = async (req, res) => {
    try {
        const chats = await chatModel.find({ users: { $in: [req.user._id] } }).populate('users').populate('latestMessage')
        if (!chats) {
            res.json({ success: true, chats: 'empty' })
        } else {
            res.json({ success: true, chats: chats })
        }
    } catch (error) {
        res.json({ success: false, error })
    }
}
const getSingleChats = async (req, res) => {
    try {
        const otherUser = await userModel.findOne({ _id: req.query.id })
        const user = await userModel.findOne({ _id: req.user._id })
        const chat = await chatModel.findOne({ users: { $all: [otherUser._id, user._id] } })
        if (chat) {
            res.json({ success: true, chatId: chat._id })
        } else {
            const newChat = await chatModel.create({
                users: [user._id, otherUser._id]
            })
            res.json({ success: true, chatId: newChat._id })
        }
    } catch (error) {
        res.json({ success: false, error })
    }
}
const getMessages = async (req, res) => {
    try {
        const messages = await messageModels.find({ chat: req.query.chatId }).populate('sender')
        const chat = await chatModel.findOne({ _id: req.query.chatId }).populate('users')



        if (messages.length == 0) {
            console.log("messages");
            res.json({ success: true, messages: 'empty', chat })
        } else {
            res.json({ success: true, messages, chat })
        }
    } catch (error) {
        console.log(error);
    }
}
const sendMessage = async (data) => {
    try {
        console.log(data, 'aslfjksb');
        // const { newMessage, chatId } = req.body
        // // let newMessage = {
        // //     sender:req.user._id,
        // //     content : content,
        // //     chat : chatId
        // // }
        let message = await messageModels.create({
            sender: data.sender,
            content: data.content,
            chat: data.chat
        })
        // message = await message.populate('sender')
        // message = await message.populate('chat')
        await chatModel.findByIdAndUpdate(data.chat, {
            latestMessage: message
        })
        // // res.json({success : true ,message})
    } catch (error) {
        res.json({ success: false, error })
    }
}
const searchUser = async (req, res) => {
    try {
        const { value } = req.query

        const result = await userModel.find({ username: { $regex: value, $options: 'i' } })
        res.json({ success: true, result })
    } catch (error) {

    }
}

module.exports = {
    userSignup,
    login,
    googleLogin,
    homeView,
    getNotification,
    editProfilePic,
    suggestedList,
    followHandle,
    unfollowHandle,
    getDetails,
    profile,
    savepost,
    followersList,
    followingsList,
    reportUser,
    GetProducts,
    Addproduct,
    getChats,
    getSingleChats,
    getMessages,
    sendMessage,
    searchUser
}