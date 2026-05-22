-- Create game_history table
CREATE TABLE IF NOT EXISTS public.game_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id),
  hand_number INT,
  winners JSONB,
  pot_amount BIGINT,
  winning_hand TEXT,
  community_cards JSONB,
  player_hands JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "game_history_select_all" ON public.game_history 
  FOR SELECT USING (true);

CREATE POLICY "game_history_insert_service" ON public.game_history 
  FOR INSERT WITH CHECK (true);
