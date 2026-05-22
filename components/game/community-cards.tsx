'use client'

import { Card } from '@/lib/types'
import { PlayingCard, CommunityCardPlaceholder } from './playing-card'
import { motion } from 'framer-motion'

interface CommunityCardsProps {
  cards: Card[]
}

export function CommunityCards({ cards }: CommunityCardsProps) {
  // Always show 5 card slots
  const displayCards = [...cards]
  while (displayCards.length < 5) {
    displayCards.push(null as unknown as Card)
  }

  return (
    <div className="flex items-center gap-2">
      {displayCards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {card ? (
            <PlayingCard card={card} faceUp={true} size="md" />
          ) : (
            <CommunityCardPlaceholder size="md" />
          )}
        </motion.div>
      ))}
    </div>
  )
}
