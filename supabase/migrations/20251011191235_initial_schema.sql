-- Create rooms table with auth
CREATE TABLE public.rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  CONSTRAINT rooms_name_check CHECK (char_length(name) >= 1)
);

-- Create clips table
CREATE TABLE public.clips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  CONSTRAINT clips_content_check CHECK (char_length(content) >= 1)
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms
CREATE POLICY "Users can view their own rooms"
  ON public.rooms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create rooms"
  ON public.rooms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their rooms"
  ON public.rooms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their rooms"
  ON public.rooms FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for clips
CREATE POLICY "Users can view clips in their rooms"
  ON public.clips FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.rooms
    WHERE rooms.id = clips.room_id
    AND rooms.user_id = auth.uid()
  ));

CREATE POLICY "Users can create clips"
  ON public.clips FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.rooms
    WHERE rooms.id = clips.room_id
    AND rooms.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their clips"
  ON public.clips FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.rooms
    WHERE rooms.id = clips.room_id
    AND rooms.user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX rooms_user_id_idx ON public.rooms(user_id);
CREATE INDEX clips_room_id_idx ON public.clips(room_id);
