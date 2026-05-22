'use client'

import { PlayerState, RoomPlayer, Card } from '@/lib/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PlayingCard } from './playing-card'
import { cn } from '@/lib/utils'
import { Coins } from 'lucide-react'

interface RoomPlayerWithProfile extends RoomPlayer {
  profile: { id: string; username: string; avatar_url: string | null; chips: number }
}

interface PlayerSeatProps {
  seatNumber: number
  player?: RoomPlayerWithProfile
  playerState?: PlayerState
  holeCards?: Card[]
  isCurrentPlayer: boolean
  isActive: boolean
  showCards: boolean
}

export function PlayerSeat({
  seatNumber,
  player,
  playerState,
  holeCards,
  isCurrentPlayer,
  isActive,
  showCards,
}: PlayerSeatProps) {
  if (!player) {
    // Empty seat
    return (
      <div className="w-24 h-24 rounded-full border-2 border-dashed border-border/50 flex items-center justify-center bg-background/20">
        <span className="text-xs text-muted-foreground">Seat {seatNumber + 1}</span>
      </div>
    )
  }

  const chips = playerState?.chips ?? player.chips_in_game
  const bet = playerState?.bet ?? 0
  const folded = playerState?.folded ?? false
  const isAllIn = playerState?.allIn ?? false
  const isDealer = playerState?.isDealer ?? false

  return (
    <div className={cn(
      "relative flex flex-col items-center gap-1",
      folded && "opacity-50"
    )}>
      {/* Cards */}
      {holeCards && holeCards.length === 2 && (
        <div className="flex -space-x-4 mb-1">
          <PlayingCard card={holeCards[0]} faceUp={showCards && !folded} size="sm" />
          <PlayingCard card={holeCards[1]} faceUp={showCards && !folded} size="sm" />
        </div>
      )}

      {/* Player Avatar & Info */}
      <div className={cn(
        "relative p-2 rounded-lg bg-card border-2 transition-all",
        isActive ? "border-primary active-glow" : "border-border",
        isCurrentPlayer && "ring-2 ring-primary/50"
      )}>
        {/* Dealer Button */}
        {isDealer && (
          <Badge 
            className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-1.5"
          >
            D
          </Badge>
        )}

        {/* All-in Badge */}
        {isAllIn && (
          <Badge 
            variant="destructive"
            className="absolute -top-2 -left-2 text-xs px-1.5"
          >
            ALL IN
          </Badge>
        )}

        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={player.profile.avatar_url || undefined} />
            <AvatarFallback className="bg-secondary text-sm">
              {player.profile.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className={cn(
              "text-sm font-medium truncate max-w-[80px]",
              isCurrentPlayer ? "text-primary" : "text-foreground"
            )}>
              {player.profile.username}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Coins className="h-3 w-3" />
              {chips.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Current Bet */}
      {bet > 0 && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
          <Badge variant="outline" className="bg-card text-xs">
            {bet.toLocaleString()}
          </Badge>
        </div>
      )}
    </div>
  )
}
