'use client'

import { Coins } from 'lucide-react'
import { motion } from 'framer-motion'

interface PotDisplayProps {
  pot: number
}

export function PotDisplay({ pot }: PotDisplayProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/90 border border-primary/30 shadow-lg"
    >
      <Coins className="h-5 w-5 text-primary" />
      <span className="font-bold text-lg text-primary">{pot.toLocaleString()}</span>
    </motion.div>
  )
}
