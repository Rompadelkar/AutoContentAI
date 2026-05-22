'use client'

import { Card as CardType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface PlayingCardProps {
  card: CardType
  faceUp?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

const SUIT_COLORS: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-foreground',
  spades: 'text-foreground',
}

const SIZE_CLASSES = {
  sm: 'w-10 h-14 text-xs',
  md: 'w-14 h-20 text-sm',
  lg: 'w-20 h-28 text-base',
}

export function PlayingCard({ card, faceUp = true, size = 'md', className }: PlayingCardProps) {
  const sizeClass = SIZE_CLASSES[size]
  const suitSymbol = SUIT_SYMBOLS[card.suit]
  const suitColor = SUIT_COLORS[card.suit]

  return (
    <motion.div
      initial={{ rotateY: 90 }}
      animate={{ rotateY: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "playing-card rounded-md flex items-center justify-center shadow-lg",
        sizeClass,
        faceUp ? "bg-white" : "playing-card-back",
        className
      )}
    >
      {faceUp ? (
        <div className={cn("flex flex-col items-center", suitColor)}>
          <span className="font-bold leading-none">{card.rank}</span>
          <span className="leading-none">{suitSymbol}</span>
        </div>
      ) : (
        <div className="w-full h-full rounded-md bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-700" />
      )}
    </motion.div>
  )
}

interface CommunityCardPlaceholderProps {
  size?: 'sm' | 'md' | 'lg'
}

export function CommunityCardPlaceholder({ size = 'md' }: CommunityCardPlaceholderProps) {
  const sizeClass = SIZE_CLASSES[size]
  
  return (
    <div className={cn(
      "rounded-md border-2 border-dashed border-muted-foreground/30 bg-background/20",
      sizeClass
    )} />
  )
}
