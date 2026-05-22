-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.profiles(id),
  message TEXT NOT NULL,
  is_emoji BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "chat_messages_select_all" ON public.chat_messages 
  FOR SELECT USING (true);

CREATE POLICY "chat_messages_insert_own" ON public.chat_messages 
  FOR INSERT WITH CHECK (auth.uid() = player_id);
