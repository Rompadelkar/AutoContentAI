import { Card, Suit, Rank } from '@/lib/types'

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

/**
 * Creates a fresh 52-card deck
 */
export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank })
    }
  }
  return deck
}

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Deal cards from the deck
 */
export function dealCards(deck: Card[], count: number): { cards: Card[]; remainingDeck: Card[] } {
  const cards = deck.slice(0, count)
  const remainingDeck = deck.slice(count)
  return { cards, remainingDeck }
}

/**
 * Get card value for sorting/comparison
 */
export function getCardValue(rank: Rank): number {
  const values: Record<Rank, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
  }
  return values[rank]
}

/**
 * Sort cards by value (highest first)
 */
export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => getCardValue(b.rank) - getCardValue(a.rank))
}

/**
 * Get card display string
 */
export function getCardDisplay(card: Card): string {
  const suitSymbols: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  }
  return `${card.rank}${suitSymbols[card.suit]}`
}

/**
 * Check if card is red (hearts/diamonds)
 */
export function isRedCard(card: Card): boolean {
  return card.suit === 'hearts' || card.suit === 'diamonds'
}
