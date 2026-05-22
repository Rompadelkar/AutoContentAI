// Database types
export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  chips: number
  games_played: number
  games_won: number
  biggest_win: number
  last_daily_reward: string | null
  created_at: string
}

export interface Room {
  id: string
  name: string
  host_id: string
  is_private: boolean
  room_code: string | null
  min_buy_in: number
  max_buy_in: number
  small_blind: number
  big_blind: number
  max_players: number
  current_players: number
  status: 'waiting' | 'playing' | 'finished'
  created_at: string
}

export interface RoomPlayer {
  id: string
  room_id: string
  player_id: string
  seat_number: number | null
  chips_in_game: number
  is_active: boolean
  joined_at: string
}

export interface GameState {
  id: string
  room_id: string
  deck: Card[]
  community_cards: Card[]
  player_hands: Record<string, Card[]>
  pot: number
  side_pots: SidePot[]
  current_bet: number
  current_player_id: string | null
  dealer_seat: number
  phase: GamePhase
  player_states: Record<string, PlayerState>
  last_action: GameAction | null
  turn_started_at: string | null
  hand_number: number
  updated_at: string
}

export interface GameHistory {
  id: string
  room_id: string
  hand_number: number
  winner_id: string | null
  winning_hand: string | null
  pot_amount: number | null
  community_cards: Card[] | null
  player_hands: Record<string, Card[]> | null
  created_at: string
}

export interface ChatMessage {
  id: string
  room_id: string
  player_id: string
  message: string
  is_emoji: boolean
  created_at: string
}

export interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
}

// Game types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'

export interface Card {
  suit: Suit
  rank: Rank
}

export type GamePhase = 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'

export interface PlayerState {
  chips: number
  bet: number
  folded: boolean
  allIn: boolean
  hasActed: boolean
  isDealer: boolean
  isSmallBlind: boolean
  isBigBlind: boolean
  seatNumber: number
}

export interface SidePot {
  amount: number
  eligiblePlayers: string[]
}

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in'

export interface GameAction {
  playerId: string
  type: ActionType
  amount?: number
  timestamp: string
}

// Hand rankings
export type HandRank = 
  | 'royal-flush'
  | 'straight-flush'
  | 'four-of-a-kind'
  | 'full-house'
  | 'flush'
  | 'straight'
  | 'three-of-a-kind'
  | 'two-pair'
  | 'pair'
  | 'high-card'

export interface HandEvaluation {
  rank: HandRank
  rankValue: number
  description: string
  cards: Card[]
}

// Room with players joined
export interface RoomWithPlayers extends Room {
  players: (RoomPlayer & { profile: Profile })[]
  host: Profile
}

// Pusher event types
export interface PusherGameEvent {
  type: 'game-state-update' | 'player-action' | 'chat-message' | 'player-joined' | 'player-left'
  data: unknown
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
