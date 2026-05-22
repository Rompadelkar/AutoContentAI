-- Create room_players table
CREATE TABLE IF NOT EXISTS public.room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.profiles(id),
  seat_position INT NOT NULL,
  chips_at_table INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_sitting_out BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, seat_position),
  UNIQUE(room_id, player_id)
);

-- Enable RLS
ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "room_players_select_all" ON public.room_players 
  FOR SELECT USING (true);

CREATE POLICY "room_players_insert_own" ON public.room_players 
  FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "room_players_update_own" ON public.room_players 
  FOR UPDATE USING (auth.uid() = player_id);

CREATE POLICY "room_players_delete_own" ON public.room_players 
  FOR DELETE USING (auth.uid() = player_id);
