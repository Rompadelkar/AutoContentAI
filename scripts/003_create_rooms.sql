-- Create rooms table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  host_id UUID REFERENCES public.profiles(id),
  is_private BOOLEAN DEFAULT false,
  min_buy_in INT DEFAULT 100,
  max_buy_in INT DEFAULT 10000,
  small_blind INT DEFAULT 10,
  big_blind INT DEFAULT 20,
  max_players INT DEFAULT 6,
  status TEXT DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "rooms_select_public" ON public.rooms 
  FOR SELECT USING (is_private = false OR host_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.room_players rp WHERE rp.room_id = id AND rp.player_id = auth.uid()
  ));

CREATE POLICY "rooms_insert_authenticated" ON public.rooms 
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "rooms_update_host" ON public.rooms 
  FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "rooms_delete_host" ON public.rooms 
  FOR DELETE USING (auth.uid() = host_id);
