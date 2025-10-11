import { io, Socket } from 'socket.io-client'

interface UseSocketReturn {
  socket: Readonly<Ref<Socket | null>>
  isConnected: Readonly<Ref<boolean>>
  connect: () => void
  disconnect: () => void
  emit: (event: string, data?: any) => void
  on: (event: string, callback: (...args: any[]) => void) => void
  off: (event: string, callback?: (...args: any[]) => void) => void
  // Clipboard-specific methods
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  shareClipboard: (roomId: string, content: string) => void
  requestQR: (roomId: string) => void
}

// Singleton socket instance using useState
const socketInstance = ref<Socket | null>(null)
const isConnected = ref(false)

export const useSocket = (): UseSocketReturn => {
  const config = useRuntimeConfig()
  const socketUrl = config.public.socketUrl

  const connect = () => {
    // If already connected, do nothing
    if (socketInstance.value?.connected) {
      console.log('Socket already connected')
      return
    }

    // If socket exists but disconnected, try to reconnect
    if (socketInstance.value && !socketInstance.value.connected) {
      console.log('Reconnecting existing socket...')
      socketInstance.value.connect()
      return
    }

    // Create new socket instance
    console.log('Creating new socket connection...')
    socketInstance.value = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    })

    // Set up event listeners only once
    socketInstance.value.on('connect', () => {
      isConnected.value = true
      console.log('✅ Socket connected:', socketInstance.value?.id)
    })

    socketInstance.value.on('disconnect', (reason) => {
      isConnected.value = false
      console.log('❌ Socket disconnected:', reason)
    })

    socketInstance.value.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error.message)
      isConnected.value = false
    })

    socketInstance.value.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}...`)
    })

    socketInstance.value.on('reconnect', (attempt) => {
      console.log(`✅ Reconnected after ${attempt} attempts`)
    })
  }

  const disconnect = () => {
    if (socketInstance.value) {
      console.log('Disconnecting socket...')
      socketInstance.value.disconnect()
      socketInstance.value = null
      isConnected.value = false
    }
  }

  const emit = (event: string, data?: any) => {
    if (socketInstance.value?.connected) {
      socketInstance.value.emit(event, data)
    } else {
      console.warn(`Cannot emit "${event}": socket not connected`)
    }
  }

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socketInstance.value) {
      socketInstance.value.on(event, callback)
    }
  }

  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socketInstance.value) {
      socketInstance.value.off(event, callback)
    }
  }

  // Clipboard-specific methods
  const joinRoom = (roomId: string) => {
    emit('join-room', roomId)
  }

  const leaveRoom = (roomId: string) => {
    emit('leave-room', roomId)
  }

  const shareClipboard = (roomId: string, content: string) => {
    emit('clipboard-update', {
      roomId,
      content,
      timestamp: Date.now()
    })
  }

  const requestQR = (roomId: string) => {
    emit('request-qr', { roomId })
  }

  return {
    socket: readonly(socketInstance),
    isConnected: readonly(isConnected),
    connect,
    disconnect,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
    shareClipboard,
    requestQR
  }
}