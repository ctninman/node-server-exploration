const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const mongoose = require('mongoose')
const { message } = require('statuses')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
mongoose.connect('mongodb+srv://user:poopypass@cluster0.id3ucgr.mongodb.net/?retryWrites=true&w=majority', (err) => {
	console.log('mongo db connection', err)
})

const Message = mongoose.model('Message', {
	name: String,
	message: String
})

// let messages = [
// 	{name: "Chris", message: "Hi son"},
// 	{name: "Matteo", message: "Hello father"}
// 	]	

app.get('/messages', (req, res) => {
	Message.find({}, (err, messages) => {

		res.send(messages)
	})
})

// app.post('/messages', (req, res) => {
// 	let newMessage = new Message(req.body)

// 	// newMessage.save((err) => {
// 		//rewritten with promises
// 		newMessage.save().then(() => {
// 		// if (err) {
// 		// 	sendStatus(500)
// 		// }
// 		Message.findOne({message: 'badword'}, (err, censored) => {
// 			if(censored) {
// 				console.log('naughty', censored)
// 				Message.deleteOne({_id: censored.id}, (err) => {
// 					console.log('removed naughty')
// 				})
// 			}
// 		})
// 		// messages.push(req.body)
// 		io.emit('message', req.body)
// 		res.sendStatus(200)
// 	}).catch((err) => {
// 		res.sendStatus(500)
// 	})
// })

//CLEANED UP WITH PROMISES
app.post('/messages', (req, res) => {
	let newMessage = new Message(req.body)

	newMessage.save()
	.then(() => {
		console.log('saved')
		return Message.findOne({message: 'badword'})
	})
	.then(censored => {
		if(censored) {
			console.log('naughty', censored)
			return Message.deleteOne({_id: censored.id})
		}
		io.emit('message', req.body)
		res.sendStatus(200)
	})
	.catch((err) => {
		res.sendStatus(500)
		return console.error(err)
	})
})

io.on('connection', (socket) => {
	console.log('a user connected')
})

const server = http.listen(3005, () => {
	console.log('server is listening on port', server.address().port)
})