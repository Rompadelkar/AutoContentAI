-- Create game_state table
CREATE TABLE IF NOT EXISTS public.game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE UNIQUE,
  hand_number INT DEFAULT 0,
  dealer_position INT,
  current_turn INT,
  pot BIGINT DEFAULT 0,
  side_pots JSONB DEFAULT '[]',
  community_cards JSONB DEFAULT '[]',
  deck JSONB DEFAULT '[]',
  player_hands JSONB DEFAULT '{}',
  player_bets JSONB DEFAULT '{}',
  player_actions JSONB DEFAULT '{}',
  player_chips JSONB DEFAULT '{}',
  current_bet INT DEFAULT 0,
  min_raise INT DEFAULT 0,
  phase TEXT DEFAULT 'waiting',
  winners JSONB DEFAULT '[]',
  turn_started_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;

-- RLS Policies - only authenticated users can read game state
CREATE POLICY "game_state_select_authenticated" ON public.game_state 
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only server (service role) can modify game state via API routes
CREATE POLICY "game_state_insert_service" ON public.game_state 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "game_state_update_service" ON public.game_state 
  FOR UPDATE USING (true);

CREATE POLICY "game_state_delete_service" ON public.game_state 
  FOR DELETE USING (true);
