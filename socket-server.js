import { Server } from 'socket.io'
import { createServer } from 'http'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`)

  socket.on('join-room', (roomId) => {
    socket.join(roomId)
    console.log(`🏠 Socket ${socket.id} joined room ${roomId}`)
    socket.to(roomId).emit('user-joined', { userId: socket.id })
  })

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId)
    console.log(`🚪 Socket ${socket.id} left room ${roomId}`)
    socket.to(roomId).emit('user-left', { userId: socket.id })
  })

  socket.on('clipboard-update', (data) => {
    console.log(`📋 Clipboard update in room ${data.roomId}:`, data.content.substring(0, 50) + '...')
    socket.to(data.roomId).emit('clipboard-sync', {
      content: data.content,
      timestamp: data.timestamp,
      userId: socket.id
    })
  })

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`)
  })
})

const PORT = 3001
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.io server running on http://localhost:${PORT}`)
})