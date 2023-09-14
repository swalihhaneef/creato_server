const userModel = require('../Model/UserSchema')
const PostModel = require('../Model/postSchema')
const notificationModel = require('../Model/notificationModel')
const commentModel = require('../Model/commentModel')
// const { db, storage } = require('../Model/firebase')
// const { collection, getDoc, getDocs, updateDoc, arrayUnion, doc, arrayRemove, query, where } = require('firebase/firestore')
// const { ref, uploadBytes, getDownloadURL } = require('firebase/storage')
const statusModel = require('../Model/status')


let message
const addPost = async (req, res) => {
    try {
        console.log('here');
        const { convertedImage, description, date } = req.body
        const userId = req.user._id
        PostModel.create({
            discription: description,
            post: convertedImage,
            time: date,
            userId: userId
        })
        res.json({ success: true, message: 'success' })

    } catch (error) {
        res.json({ success: false, error, message: 'something went wrong!!' })
        console.log(error);
    }
}
const getPost = async (req, res) => {
    try {
        const userId = req.user._id

        const user = await userModel.findOne({ _id: userId }).populate('following')

        const followingUsers = user.following;

        const posts = await PostModel.find({})
        .populate('comment')
        .populate('userId');
      
        console.log(posts);
        const filteredPosts = posts.filter((post) => {
            return followingUsers.some(followingUser =>
                followingUser._id.equals(post.userId._id)
            );
        });


        res.json({ success: true, filteredPosts })

    } catch (error) {
        console.log(error);
        res.json({ success: false })
    }
}

const handleLike = async (req, res) => {
    try {
        const { postId,userId } = req.body
        console.log(postId);
        const user_Id = req.user._id
        const post = await PostModel.findOne({ _id: postId })
        const user = await userModel.findOne({ _id: user_Id })
        const date = new Date();
        const likeArray = post.like
        if (likeArray.includes(user._id)) {
            // Remove userId from likeArray
            const updatedLikeArray = likeArray.filter(id => !id.equals(user_Id));

            // Update the post's like field with the updatedLikeArray
            post.like = updatedLikeArray;
            await post.save();

            let dislike = 'dislike';
            res.json({ success: true, dislike });
        } else {


            await PostModel.updateOne({ _id: postId }, { like: [...likeArray, user._id] })
            let like = 'like'
            const notifyUser = await userModel.findOne({_id:userId})
            console.log(notifyUser);
            const notify = await notificationModel.create({
                userId:user._id,
                reciepients:notifyUser._id,
                content:'like',
                postId:post._id,
                time:date
            })
            res.json({ success: true, like })
        }
    }catch (error) {
        console.log(error);
    }
}
const handleComment = async (req, res) => {
    try {
        const { postId, comment } = req.body
        console.log(postId, comment);
        const userId = req.user._id
        const currentTime = new Date();
        const Newcomment = await commentModel.create({
            comment:comment,
            userId:userId,
            time:currentTime
        })
        const post = await PostModel.findByIdAndUpdate(postId, {
            $push: { comment: Newcomment }
          });          
          let commented = 'commented'
        res.json({ success: true , commented})
    } catch (error) {
        console.log(error);
        res.json({ success: false, error })
    }
}
const replyComment = async(req,res)=>{
    try {
        const {commentId,comment,userId} = req.body
      
        const currentTime = new Date();
        let newReply ={
            content:comment,
            userId:userId,
            time:currentTime
        }
        const reply = await commentModel.findByIdAndUpdate(commentId,{
            reply:newReply
        })
        let replied ='replied'
        res.json({success : true ,replied})
    } catch (error) {
        console.log(error);
    }
}
const likeComment = async(req,res)=>{
    try {
        const {commentId,userId} = req.body
        const comment = await commentModel.findByIdAndUpdate(commentId,{
            like:userId
        })
        let liked = 'liked'
        res.json({success : true ,liked})
    } catch (error) {
        res.json({success:false})
    }
}
const reportPost = async (req, res) => {
    try {
        const { postId, reason } = req.body
        const userId = req.user._id
        const post = await PostModel.findOne({ _id: postId });
        const user = await userModel.findOne({ _id: userId });
        const currentTime = new Date();
        const obj = {
            userId: userId,
            reason: reason,
            time: currentTime,
        }
        const reportedArray = post.is_reported
        reportedArray.push(obj)
        await post.save()
        res.json({ success: true })
    } catch (error) {
        res.json({ success: false, error })
    }
}
const handleExplore = async (req, res) => {
    try {
        const userId = req.user._id

        const user = await userModel.findOne({ _id: userId }).populate('following')

        const followingUsers = user.following;
        const x = followingUsers.map((item)=> item._id)
        console.log(x,'dfghjk');
        const posts = await PostModel.find({}).populate('userId').populate('comment.userId')

        const filteredPosts = posts.filter((post) => {
            return !followingUsers.some(followingUser =>
                followingUser._id.equals(post.userId._id)
            )&& !post.userId._id.equals(user._id)

        });
        
        console.log(filteredPosts,'dfghj');
        res.json({ success: true, filteredPosts })
    } catch (error) {
        console.log(error);
    }
}
const addStatus = async (req,res)=>{
    try {
        const {id,convertedImage} = req.body
       
        const user = await userModel.findOne({_id:id})
        const status = await statusModel.create({
            userId:user._id,
            photo:convertedImage,
          
        })
        if(status){
            res.json({success : true })
        }
    } catch (error) {
        res.json({success : false })
      console.log(error); 
    }
}
module.exports = {
    addPost,
    getPost,
    handleLike,
    handleComment,
    replyComment,
    likeComment,
    reportPost,
    handleExplore,
    addStatus
}