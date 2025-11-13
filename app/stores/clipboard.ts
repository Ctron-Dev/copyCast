import type { Database } from '~/types/database.types'

type Clip = Database['public']['Tables']['clips']['Row']
type Room = Database['public']['Tables']['rooms']['Row']

export const useClipboardStore = defineStore('clipboard', () => {
  const supabase = useSupabaseClient<Database>()
  
  // State
  const clips = ref<Clip[]>([])
  const currentRoom = ref<Room | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const createRoom = async (name: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: supabaseError } = await supabase
        .from('rooms')
        .insert({ name })
        .select()
        .single()

      if (supabaseError) throw supabaseError
      
      currentRoom.value = data
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create room'
      throw err
    } finally {
      loading.value = false
    }
  }

  const joinRoom = async (roomId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: supabaseError } = await supabase
        .from('rooms')
        .select()
        .eq('id', roomId)
        .single()

      if (supabaseError) throw supabaseError
      
      currentRoom.value = data
      await fetchClips(roomId)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to join room'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addClip = async (content: string) => {
    if (!currentRoom.value) throw new Error('No room selected')
    
    try {
      loading.value = true
      error.value = null
      
      const { data, error: supabaseError } = await supabase
        .from('clips')
        .insert({
          content,
          room_id: currentRoom.value.id
        })
        .select()
        .single()

      if (supabaseError) throw supabaseError
      
      clips.value.unshift(data)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add clip'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchClips = async (roomId?: string) => {
    const targetRoomId = roomId || currentRoom.value?.id
    if (!targetRoomId) throw new Error('No room ID provided')
    
    try {
      loading.value = true
      error.value = null
      
      const { data, error: supabaseError } = await supabase
        .from('clips')
        .select()
        .eq('room_id', targetRoomId)
        .order('created_at', { ascending: false })

      if (supabaseError) throw supabaseError
      
      clips.value = data || []
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch clips'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteClip = async (clipId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const { error: supabaseError } = await supabase
        .from('clips')
        .delete()
        .eq('id', clipId)

      if (supabaseError) throw supabaseError
      
      clips.value = clips.value.filter(clip => clip.id !== clipId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete clip'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearClips = () => {
    clips.value = []
    currentRoom.value = null
    error.value = null
  }

  return {
    // State
    clips: readonly(clips),
    currentRoom: readonly(currentRoom),
    loading: readonly(loading),
    error: readonly(error),
    
    // Actions
    createRoom,
    joinRoom,
    addClip,
    fetchClips,
    deleteClip,
    clearClips
  }
})