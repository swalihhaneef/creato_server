const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const http = require('http').createServer(app)
const socket = require('socket.io')
const userController = require('../server/Controllers/userController')
const env = require('dotenv').config()
mongoose.connect(process.env.mongoDb, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(()=>{
        console.log('db');
    })
app.use(cors())
app.use(express.json({limit:'30mb'}))

const userRouter = require('./Routes/userRoute')
const adminRouter = require('./Routes/adminRoute')
app.use('/',userRouter)
app.use('/admin',adminRouter)


const server=http.listen(process.env.port,() =>{
    console.log('server running');
})

const io = socket(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  })
  
  
io.on('connection',(socket)=>{
  // console.log('connected to socket');
  socket.on('setup',(id)=>{
    socket.join(id);
    console.log(id);
    socket.emit('connected')
  })
  socket.on('joinRoom',(room)=>{
    socket.join(room)
    console.log(room,'user joined');
  })
  socket.on('NewMessage',(chatId,data)=>{
    console.log(data);
   try {
    console.log('reached');
   userController.sendMessage(data)
  socket.emit('messageResponse',chatId,data)
   } catch (error) {
    console.log('error');
   }
  })
})
  
//     socket.on("chatMessage", (receivedClubId, message) => {
//       console.log(`Received message: ${message} in room: ${receivedClubId}`);
//       // Emit the message to the specific room based on the clubId
//       io.of("/chat").to(receivedClubId).emit("message", message, receivedClubId);
//     });
//     socket.on("error" , err =>{
//       console.log('backend error ' , err);
//     })
  
//     socket.on("disconnect", (ev) => {
//       console.log("Socket disconnected" , ev);
//     });

//
//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