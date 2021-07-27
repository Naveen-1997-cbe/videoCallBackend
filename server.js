const express = require("express")
const http = require("http")
const cors = require('cors');
const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
})

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send('Server is running.');
})

app.use(express.json());

io.on("connection", (socket) => {
	let RoomID = "";

	socket.on('join-room',(roomid)=>{
		RoomID = roomid
		socket.join(RoomID)
		socket.to(RoomID).emit('USer Connected','hello world')
		socket.emit("me", socket.id)
	})

	

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	})

	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name })
	})

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", {signal : data.signal , from : data.from})
	})

	socket.on('otherUserName',(personName)=>{
		socket.emit("otherUserName",personName)
	})
	
	socket.on('mutePerson',(name)=>{
		socket.broadcast.emit('mutePerson',{name , access:true})
	})

	socket.on('unmutePerson',({name})=>{
		socket.broadcast.emit('unmutePerson',{name , access:false})
	})

	socket.on('take id to call',(sendId)=>{
		socket.to(RoomID).broadcast.emit('take id to call',(sendId))
	})
	socket.on('screenshare',(screen)=>{
		console.log(screen)
		socket.broadcast.emit('screenshare',(screen))
		console.log(screen)
	})
	socket.on('message', ({ name, message }) => {
		io.to(RoomID).emit('message', { name, message })
	})
	socket.on('endCallRoute',(value)=>{
		io.to(RoomID).emit('endCallRoute',value)
	})
	socket.on('endCall',(data)=>{
		console.log('data',data)
		io.to(RoomID).emit('endCall',data)
	})
	socket.on('fileName',(fileName)=>{
		console.log(fileName)
		io.to(RoomID).emit('fileName',fileName)
	})
	
})

server.listen(PORT, () => console.log(`server is running on port ${PORT}`));

