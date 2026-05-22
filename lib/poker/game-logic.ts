import { Card, GameState, PlayerState, ActionType, GamePhase, SidePot } from '@/lib/types'
import { createDeck, shuffleDeck, dealCards } from './deck'
import { determineWinners } from './hand-evaluator'

export interface GamePlayer {
  id: string
  seatNumber: number
  chips: number
}

/**
 * Initialize a new hand
 */
export function initializeHand(
  roomId: string,
  players: GamePlayer[],
  dealerSeat: number,
  smallBlind: number,
  bigBlind: number
): GameState {
  // Create and shuffle deck
  let deck = shuffleDeck(createDeck())
  
  // Sort players by seat number
  const sortedPlayers = [...players].sort((a, b) => a.seatNumber - b.seatNumber)
  
  // Calculate blind positions
  const numPlayers = sortedPlayers.length
  const smallBlindSeat = getNextActiveSeat(dealerSeat, sortedPlayers)
  const bigBlindSeat = getNextActiveSeat(smallBlindSeat, sortedPlayers)
  
  // Deal hole cards
  const playerHands: Record<string, Card[]> = {}
  const playerStates: Record<string, PlayerState> = {}
  
  for (const player of sortedPlayers) {
    const { cards, remainingDeck } = dealCards(deck, 2)
    deck = remainingDeck
    playerHands[player.id] = cards
    
    // Initialize player state
    const isDealer = player.seatNumber === dealerSeat
    const isSmallBlind = player.seatNumber === smallBlindSeat
    const isBigBlind = player.seatNumber === bigBlindSeat
    
    let initialBet = 0
    let chips = player.chips
    
    if (isSmallBlind) {
      initialBet = Math.min(smallBlind, chips)
      chips -= initialBet
    } else if (isBigBlind) {
      initialBet = Math.min(bigBlind, chips)
      chips -= initialBet
    }
    
    playerStates[player.id] = {
      chips,
      bet: initialBet,
      folded: false,
      allIn: chips === 0,
      hasActed: false,
      isDealer,
      isSmallBlind,
      isBigBlind,
      seatNumber: player.seatNumber,
    }
  }
  
  // First to act is after big blind
  const firstToAct = getNextActiveSeat(bigBlindSeat, sortedPlayers)
  const firstPlayerId = sortedPlayers.find(p => p.seatNumber === firstToAct)?.id || sortedPlayers[0].id
  
  const pot = smallBlind + bigBlind
  
  return {
    id: crypto.randomUUID(),
    room_id: roomId,
    deck,
    community_cards: [],
    player_hands: playerHands,
    pot,
    side_pots: [],
    current_bet: bigBlind,
    current_player_id: firstPlayerId,
    dealer_seat: dealerSeat,
    phase: 'preflop',
    player_states: playerStates,
    last_action: null,
    turn_started_at: new Date().toISOString(),
    hand_number: 1,
    updated_at: new Date().toISOString(),
  }
}

/**
 * Get next active seat in clockwise order
 */
function getNextActiveSeat(currentSeat: number, players: GamePlayer[]): number {
  const seats = players.map(p => p.seatNumber).sort((a, b) => a - b)
  const currentIndex = seats.indexOf(currentSeat)
  const nextIndex = (currentIndex + 1) % seats.length
  return seats[nextIndex]
}

/**
 * Get available actions for current player
 */
export function getAvailableActions(gameState: GameState): ActionType[] {
  const currentPlayerId = gameState.current_player_id
  if (!currentPlayerId) return []
  
  const playerState = gameState.player_states[currentPlayerId]
  if (!playerState || playerState.folded || playerState.allIn) return []
  
  const actions: ActionType[] = ['fold']
  
  const amountToCall = gameState.current_bet - playerState.bet
  
  if (amountToCall === 0) {
    // Can check
    actions.push('check')
  } else if (amountToCall > 0 && playerState.chips >= amountToCall) {
    // Can call
    actions.push('call')
  }
  
  // Can bet/raise if not all-in and have chips
  if (playerState.chips > amountToCall) {
    if (gameState.current_bet === 0) {
      actions.push('bet')
    } else {
      actions.push('raise')
    }
  }
  
  // Can always go all-in if have chips
  if (playerState.chips > 0) {
    actions.push('all-in')
  }
  
  return actions
}

/**
 * Process a player action
 */
export function processAction(
  gameState: GameState,
  playerId: string,
  action: ActionType,
  amount?: number
): GameState {
  const newState = { ...gameState }
  newState.player_states = { ...gameState.player_states }
  
  const playerState = { ...newState.player_states[playerId] }
  
  switch (action) {
    case 'fold':
      playerState.folded = true
      break
      
    case 'check':
      // No chips change
      break
      
    case 'call': {
      const callAmount = Math.min(newState.current_bet - playerState.bet, playerState.chips)
      playerState.chips -= callAmount
      playerState.bet += callAmount
      newState.pot += callAmount
      if (playerState.chips === 0) playerState.allIn = true
      break
    }
      
    case 'bet':
    case 'raise': {
      const betAmount = amount || newState.current_bet * 2
      const totalBet = Math.min(betAmount, playerState.chips + playerState.bet)
      const additionalChips = totalBet - playerState.bet
      playerState.chips -= additionalChips
      playerState.bet = totalBet
      newState.pot += additionalChips
      newState.current_bet = totalBet
      if (playerState.chips === 0) playerState.allIn = true
      // Reset hasActed for other players since there's a new bet
      for (const pid of Object.keys(newState.player_states)) {
        if (pid !== playerId && !newState.player_states[pid].folded && !newState.player_states[pid].allIn) {
          newState.player_states[pid] = { ...newState.player_states[pid], hasActed: false }
        }
      }
      break
    }
      
    case 'all-in': {
      const allInAmount = playerState.chips
      playerState.bet += allInAmount
      newState.pot += allInAmount
      playerState.chips = 0
      playerState.allIn = true
      if (playerState.bet > newState.current_bet) {
        newState.current_bet = playerState.bet
        // Reset hasActed for other players
        for (const pid of Object.keys(newState.player_states)) {
          if (pid !== playerId && !newState.player_states[pid].folded && !newState.player_states[pid].allIn) {
            newState.player_states[pid] = { ...newState.player_states[pid], hasActed: false }
          }
        }
      }
      break
    }
  }
  
  playerState.hasActed = true
  newState.player_states[playerId] = playerState
  
  newState.last_action = {
    playerId,
    type: action,
    amount,
    timestamp: new Date().toISOString(),
  }
  
  // Check if betting round is complete
  if (isBettingRoundComplete(newState)) {
    return advancePhase(newState)
  }
  
  // Move to next player
  newState.current_player_id = getNextActivePlayer(newState, playerId)
  newState.turn_started_at = new Date().toISOString()
  newState.updated_at = new Date().toISOString()
  
  return newState
}

/**
 * Check if betting round is complete
 */
function isBettingRoundComplete(gameState: GameState): boolean {
  const activePlayers = Object.entries(gameState.player_states)
    .filter(([, state]) => !state.folded && !state.allIn)
  
  // Only one player left (everyone else folded)
  const nonFoldedPlayers = Object.values(gameState.player_states).filter(s => !s.folded)
  if (nonFoldedPlayers.length <= 1) return true
  
  // All active players have acted and matched the bet
  return activePlayers.every(([, state]) => 
    state.hasActed && state.bet === gameState.current_bet
  )
}

/**
 * Get next active player
 */
function getNextActivePlayer(gameState: GameState, currentPlayerId: string): string | null {
  const players = Object.entries(gameState.player_states)
    .sort(([, a], [, b]) => a.seatNumber - b.seatNumber)
  
  const currentIndex = players.findIndex(([id]) => id === currentPlayerId)
  
  for (let i = 1; i < players.length; i++) {
    const nextIndex = (currentIndex + i) % players.length
    const [nextId, nextState] = players[nextIndex]
    if (!nextState.folded && !nextState.allIn) {
      return nextId
    }
  }
  
  return null
}

/**
 * Advance to next phase
 */
function advancePhase(gameState: GameState): GameState {
  const newState = { ...gameState }
  let deck = [...gameState.deck]
  
  // Check for winner by fold
  const nonFoldedPlayers = Object.entries(gameState.player_states)
    .filter(([, state]) => !state.folded)
  
  if (nonFoldedPlayers.length === 1) {
    newState.phase = 'showdown'
    newState.current_player_id = null
    return newState
  }
  
  // Reset bets for new round
  for (const playerId of Object.keys(newState.player_states)) {
    newState.player_states[playerId] = {
      ...newState.player_states[playerId],
      bet: 0,
      hasActed: false,
    }
  }
  newState.current_bet = 0
  
  // Deal community cards based on phase
  switch (gameState.phase) {
    case 'preflop': {
      // Deal flop (3 cards)
      const { cards, remainingDeck } = dealCards(deck, 3)
      newState.community_cards = cards
      deck = remainingDeck
      newState.phase = 'flop'
      break
    }
    case 'flop': {
      // Deal turn (1 card)
      const { cards, remainingDeck } = dealCards(deck, 1)
      newState.community_cards = [...gameState.community_cards, ...cards]
      deck = remainingDeck
      newState.phase = 'turn'
      break
    }
    case 'turn': {
      // Deal river (1 card)
      const { cards, remainingDeck } = dealCards(deck, 1)
      newState.community_cards = [...gameState.community_cards, ...cards]
      deck = remainingDeck
      newState.phase = 'river'
      break
    }
    case 'river': {
      // Go to showdown
      newState.phase = 'showdown'
      newState.current_player_id = null
      break
    }
  }
  
  newState.deck = deck
  
  // Set first player to act (after dealer)
  if (newState.phase !== 'showdown') {
    const players = Object.entries(newState.player_states)
      .filter(([, state]) => !state.folded && !state.allIn)
      .sort(([, a], [, b]) => a.seatNumber - b.seatNumber)
    
    // Find first active player after dealer
    const dealerSeat = gameState.dealer_seat
    for (const [playerId, state] of players) {
      if (state.seatNumber > dealerSeat || players[0][1].seatNumber === state.seatNumber) {
        newState.current_player_id = playerId
        break
      }
    }
    if (!newState.current_player_id && players.length > 0) {
      newState.current_player_id = players[0][0]
    }
  }
  
  newState.turn_started_at = new Date().toISOString()
  newState.updated_at = new Date().toISOString()
  
  return newState
}

/**
 * Calculate side pots
 */
export function calculateSidePots(gameState: GameState): SidePot[] {
  // Get all unique bet amounts from all-in players
  const allInBets = Object.values(gameState.player_states)
    .filter(s => s.allIn)
    .map(s => s.bet)
    .sort((a, b) => a - b)
  
  if (allInBets.length === 0) {
    return [{
      amount: gameState.pot,
      eligiblePlayers: Object.entries(gameState.player_states)
        .filter(([, s]) => !s.folded)
        .map(([id]) => id)
    }]
  }
  
  // Build side pots
  const sidePots: SidePot[] = []
  let previousBet = 0
  
  for (const betAmount of [...new Set(allInBets)]) {
    const potAmount = (betAmount - previousBet) * Object.values(gameState.player_states)
      .filter(s => !s.folded && s.bet >= betAmount).length
    
    const eligiblePlayers = Object.entries(gameState.player_states)
      .filter(([, s]) => !s.folded && s.bet >= betAmount)
      .map(([id]) => id)
    
    if (potAmount > 0) {
      sidePots.push({ amount: potAmount, eligiblePlayers })
    }
    previousBet = betAmount
  }
  
  // Main pot with remaining chips
  const maxBet = Math.max(...Object.values(gameState.player_states).map(s => s.bet))
  if (maxBet > previousBet) {
    const mainPotAmount = (maxBet - previousBet) * Object.values(gameState.player_states)
      .filter(s => !s.folded && s.bet === maxBet).length
    
    const eligiblePlayers = Object.entries(gameState.player_states)
      .filter(([, s]) => !s.folded && s.bet === maxBet)
      .map(([id]) => id)
    
    if (mainPotAmount > 0) {
      sidePots.push({ amount: mainPotAmount, eligiblePlayers })
    }
  }
  
  return sidePots
}

/**
 * Determine winners at showdown
 */
export function determineShowdownWinners(
  gameState: GameState
): { playerId: string; amount: number; handDescription: string }[] {
  const nonFoldedPlayers = Object.entries(gameState.player_states)
    .filter(([, state]) => !state.folded)
  
  // Single player left (everyone folded)
  if (nonFoldedPlayers.length === 1) {
    return [{
      playerId: nonFoldedPlayers[0][0],
      amount: gameState.pot,
      handDescription: 'Last player standing',
    }]
  }
  
  // Evaluate hands
  const players = nonFoldedPlayers.map(([id]) => ({
    playerId: id,
    holeCards: gameState.player_hands[id] || [],
  }))
  
  const winners = determineWinners(players, gameState.community_cards)
  const winAmount = Math.floor(gameState.pot / winners.length)
  
  return winners.map(w => ({
    playerId: w.playerId,
    amount: winAmount,
    handDescription: w.hand.description,
  }))
}

/**
 * Get next dealer seat
 */
export function getNextDealerSeat(currentDealer: number, players: GamePlayer[]): number {
  const seats = players.map(p => p.seatNumber).sort((a, b) => a - b)
  const currentIndex = seats.indexOf(currentDealer)
  if (currentIndex === -1) return seats[0]
  return seats[(currentIndex + 1) % seats.length]
}
