'use client'

import Link from 'next/link'
import { Profile, Room } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spade, ArrowLeft, Users, Coins, Copy, Play } from 'lucide-react'
import { useState } from 'react'

interface RoomWithHost extends Room {
  host: { id: string; username: string; avatar_url: string | null }
}

interface GameHeaderProps {
  room: RoomWithHost
  profile: Profile
  isHost: boolean
  canStart: boolean
  onStartGame: () => void
  isLoading: boolean
}

export function GameHeader({ room, profile, isHost, canStart, onStartGame, isLoading }: GameHeaderProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyCode = async () => {
    if (room.room_code) {
      await navigator.clipboard.writeText(room.room_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left - Back & Room Info */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/lobby">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Leave</span>
            </Link>
          </Button>
          
          <div className="flex items-center gap-2">
            <Spade className="h-6 w-6 text-primary fill-primary" />
            <div>
              <h1 className="font-semibold text-foreground text-sm sm:text-base">{room.name}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {room.current_players}/{room.max_players}
                </span>
                <span className="flex items-center gap-1">
                  <Coins className="h-3 w-3" />
                  {room.small_blind}/{room.big_blind}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Status & Actions */}
        <div className="flex items-center gap-3">
          {/* Room Code */}
          {room.is_private && room.room_code && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCode}
              className="font-mono"
            >
              <Copy className="h-3 w-3 mr-2" />
              {copied ? 'Copied!' : room.room_code}
            </Button>
          )}

          {/* Game Status */}
          <Badge variant={room.status === 'playing' ? 'default' : 'secondary'}>
            {room.status === 'playing' ? 'In Progress' : 'Waiting'}
          </Badge>

          {/* Start Game Button (host only) */}
          {canStart && (
            <Button onClick={onStartGame} disabled={isLoading} size="sm">
              <Play className="h-4 w-4 mr-2" />
              Start Game
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
