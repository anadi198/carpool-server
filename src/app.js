const express = require('express')
const http = require('http')
const Filter = require('bad-words')
const socketio = require('socket.io')

require('./db/mongoose')
const userRouter = require('./routers/userRouter')
const routesRouter = require('./routers/routesRouter')
const ratingRouter = require('./routers/ratingRouter')
const { generateMessage } = require('./utils/messages')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {
    console.log('New websocket connection')

    socket.on('join', ({ username, room }) => {
        socket.join(room)

        socket.emit('welcomeUser', generateMessage('Welcome user!'))
        socket.broadcast.to(room).emit('userJoined', generateMessage(`${username} has joined the chat!`)
        
        )
    })

    socket.on('sendMessage', (message) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            console.log('fok')
        }

        io.emit('message', generateMessage(message))
        console.log(message)
    })

    socket.on('disconnect', () => {
        io.emit('userLeft', generateMessage('A user has left...'))
    })
})


app.use(express.json())
app.use(userRouter)
app.use(routesRouter)
app.use(ratingRouter)

module.exports = server