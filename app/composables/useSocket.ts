import { io, Socket } from 'socket.io-client'

interface UseSocketReturn {
  socket: Ref<Socket | null>
  isConnected: Ref<boolean>
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

export const useSocket = (): UseSocketReturn => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)

  const config = useRuntimeConfig()
  // Use env variable for socket URL
  const socketUrl = config.public.socketUrl

  const connect = () => {
    if (socket.value?.connected) return

    socket.value = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    })

    socket.value.on('connect', () => {
      isConnected.value = true
      console.log('Socket connected')
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
      console.log('Socket disconnected')
    })

    socket.value.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      isConnected.value = false
    })
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }

  const emit = (event: string, data?: any) => {
    if (socket.value?.connected) {
      socket.value.emit(event, data)
    }
  }

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socket.value) {
      socket.value.on(event, callback)
    }
  }

  const off = (event: string, callback?: (...args: any[]) => void) => {
    if (socket.value) {
      socket.value.off(event, callback)
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

  // Auto cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    socket: readonly(socket),
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