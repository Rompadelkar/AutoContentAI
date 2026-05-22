import { Card, HandRank, HandEvaluation, Suit, Rank } from '@/lib/types'
import { getCardValue, sortCards } from './deck'

// Hand rank values (higher = better)
const HAND_RANK_VALUES: Record<HandRank, number> = {
  'royal-flush': 10,
  'straight-flush': 9,
  'four-of-a-kind': 8,
  'full-house': 7,
  'flush': 6,
  'straight': 5,
  'three-of-a-kind': 4,
  'two-pair': 3,
  'pair': 2,
  'high-card': 1,
}

const HAND_DESCRIPTIONS: Record<HandRank, string> = {
  'royal-flush': 'Royal Flush',
  'straight-flush': 'Straight Flush',
  'four-of-a-kind': 'Four of a Kind',
  'full-house': 'Full House',
  'flush': 'Flush',
  'straight': 'Straight',
  'three-of-a-kind': 'Three of a Kind',
  'two-pair': 'Two Pair',
  'pair': 'Pair',
  'high-card': 'High Card',
}

/**
 * Get all 5-card combinations from 7 cards
 */
function getCombinations(cards: Card[], size: number): Card[][] {
  const result: Card[][] = []
  
  function combine(start: number, combo: Card[]) {
    if (combo.length === size) {
      result.push([...combo])
      return
    }
    for (let i = start; i < cards.length; i++) {
      combo.push(cards[i])
      combine(i + 1, combo)
      combo.pop()
    }
  }
  
  combine(0, [])
  return result
}

/**
 * Group cards by rank
 */
function groupByRank(cards: Card[]): Map<Rank, Card[]> {
  const groups = new Map<Rank, Card[]>()
  for (const card of cards) {
    const group = groups.get(card.rank) || []
    group.push(card)
    groups.set(card.rank, group)
  }
  return groups
}

/**
 * Group cards by suit
 */
function groupBySuit(cards: Card[]): Map<Suit, Card[]> {
  const groups = new Map<Suit, Card[]>()
  for (const card of cards) {
    const group = groups.get(card.suit) || []
    group.push(card)
    groups.set(card.suit, group)
  }
  return groups
}

/**
 * Check if cards form a straight
 */
function isStraight(cards: Card[]): boolean {
  const values = cards.map(c => getCardValue(c.rank)).sort((a, b) => a - b)
  
  // Check for regular straight
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[i - 1] + 1) {
      // Check for A-2-3-4-5 (wheel)
      if (i === 4 && values[4] === 14 && values[0] === 2) {
        return true
      }
      return false
    }
  }
  return true
}

/**
 * Check if cards form a flush
 */
function isFlush(cards: Card[]): boolean {
  const suits = groupBySuit(cards)
  return Array.from(suits.values()).some(group => group.length >= 5)
}

/**
 * Evaluate a 5-card hand
 */
function evaluate5CardHand(cards: Card[]): HandEvaluation {
  const sorted = sortCards(cards)
  const rankGroups = groupByRank(cards)
  const suitGroups = groupBySuit(cards)
  
  const isFlushHand = Array.from(suitGroups.values()).some(g => g.length === 5)
  const isStraightHand = isStraight(cards)
  
  const groupSizes = Array.from(rankGroups.values())
    .map(g => g.length)
    .sort((a, b) => b - a)
  
  // Royal Flush
  if (isFlushHand && isStraightHand) {
    const values = sorted.map(c => getCardValue(c.rank))
    if (values[0] === 14 && values[4] === 10) {
      return {
        rank: 'royal-flush',
        rankValue: HAND_RANK_VALUES['royal-flush'],
        description: HAND_DESCRIPTIONS['royal-flush'],
        cards: sorted,
      }
    }
  }
  
  // Straight Flush
  if (isFlushHand && isStraightHand) {
    return {
      rank: 'straight-flush',
      rankValue: HAND_RANK_VALUES['straight-flush'],
      description: HAND_DESCRIPTIONS['straight-flush'],
      cards: sorted,
    }
  }
  
  // Four of a Kind
  if (groupSizes[0] === 4) {
    return {
      rank: 'four-of-a-kind',
      rankValue: HAND_RANK_VALUES['four-of-a-kind'],
      description: HAND_DESCRIPTIONS['four-of-a-kind'],
      cards: sorted,
    }
  }
  
  // Full House
  if (groupSizes[0] === 3 && groupSizes[1] === 2) {
    return {
      rank: 'full-house',
      rankValue: HAND_RANK_VALUES['full-house'],
      description: HAND_DESCRIPTIONS['full-house'],
      cards: sorted,
    }
  }
  
  // Flush
  if (isFlushHand) {
    return {
      rank: 'flush',
      rankValue: HAND_RANK_VALUES['flush'],
      description: HAND_DESCRIPTIONS['flush'],
      cards: sorted,
    }
  }
  
  // Straight
  if (isStraightHand) {
    return {
      rank: 'straight',
      rankValue: HAND_RANK_VALUES['straight'],
      description: HAND_DESCRIPTIONS['straight'],
      cards: sorted,
    }
  }
  
  // Three of a Kind
  if (groupSizes[0] === 3) {
    return {
      rank: 'three-of-a-kind',
      rankValue: HAND_RANK_VALUES['three-of-a-kind'],
      description: HAND_DESCRIPTIONS['three-of-a-kind'],
      cards: sorted,
    }
  }
  
  // Two Pair
  if (groupSizes[0] === 2 && groupSizes[1] === 2) {
    return {
      rank: 'two-pair',
      rankValue: HAND_RANK_VALUES['two-pair'],
      description: HAND_DESCRIPTIONS['two-pair'],
      cards: sorted,
    }
  }
  
  // Pair
  if (groupSizes[0] === 2) {
    return {
      rank: 'pair',
      rankValue: HAND_RANK_VALUES['pair'],
      description: HAND_DESCRIPTIONS['pair'],
      cards: sorted,
    }
  }
  
  // High Card
  return {
    rank: 'high-card',
    rankValue: HAND_RANK_VALUES['high-card'],
    description: HAND_DESCRIPTIONS['high-card'],
    cards: sorted,
  }
}

/**
 * Compare two hand evaluations
 * Returns positive if hand1 wins, negative if hand2 wins, 0 if tie
 */
function compareHands(hand1: HandEvaluation, hand2: HandEvaluation): number {
  // Compare by rank first
  if (hand1.rankValue !== hand2.rankValue) {
    return hand1.rankValue - hand2.rankValue
  }
  
  // Same rank - compare by card values (kickers)
  const values1 = hand1.cards.map(c => getCardValue(c.rank))
  const values2 = hand2.cards.map(c => getCardValue(c.rank))
  
  for (let i = 0; i < values1.length; i++) {
    if (values1[i] !== values2[i]) {
      return values1[i] - values2[i]
    }
  }
  
  return 0 // Tie
}

/**
 * Evaluate the best 5-card hand from 7 cards (2 hole + 5 community)
 */
export function evaluateBestHand(holeCards: Card[], communityCards: Card[]): HandEvaluation {
  const allCards = [...holeCards, ...communityCards]
  
  if (allCards.length < 5) {
    // Not enough cards for a hand
    return {
      rank: 'high-card',
      rankValue: 1,
      description: 'Not enough cards',
      cards: sortCards(allCards),
    }
  }
  
  const combinations = getCombinations(allCards, 5)
  
  let bestHand: HandEvaluation | null = null
  
  for (const combo of combinations) {
    const evaluation = evaluate5CardHand(combo)
    if (!bestHand || compareHands(evaluation, bestHand) > 0) {
      bestHand = evaluation
    }
  }
  
  return bestHand!
}

/**
 * Determine winners from a list of players and their hands
 */
export function determineWinners(
  players: { playerId: string; holeCards: Card[] }[],
  communityCards: Card[]
): { playerId: string; hand: HandEvaluation }[] {
  const evaluations = players.map(player => ({
    playerId: player.playerId,
    hand: evaluateBestHand(player.holeCards, communityCards),
  }))
  
  // Sort by hand strength (best first)
  evaluations.sort((a, b) => compareHands(b.hand, a.hand))
  
  // Find all players with the best hand (could be ties)
  const bestHand = evaluations[0].hand
  const winners = evaluations.filter(e => compareHands(e.hand, bestHand) === 0)
  
  return winners
}
