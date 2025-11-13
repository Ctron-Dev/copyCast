export interface Database {
  public: {
    Tables: {
      clips: {
        Row: {
          id: string
          content: string
          room_id: string
          created_at: string
          expires_at?: string
        }
        Insert: {
          id?: string
          content: string
          room_id: string
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          content?: string
          room_id?: string
          created_at?: string
          expires_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          name: string
          user_id: string
          created_at: string
          expires_at?: string
        }
        Insert: {
          id?: string
          name: string
          user_id: string
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          name?: string
          user_id?: string
          created_at?: string
          expires_at?: string
        }
      }
    }
  }
}
