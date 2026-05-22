'use client'

import { useState, useEffect } from 'react'
import { Profile, Room, GameState, RoomPlayer } from '@/lib/types'
import { GameHeader } from './game-header'
import { PokerTable } from './poker-table'
import { BettingControls } from './betting-controls'
import { GameChat } from './game-chat'
import { BuyInDialog } from './buy-in-dialog'
import { useRouter } from 'next/navigation'

interface RoomWithHost extends Room {
  host: { id: string; username: string; avatar_url: string | null }
}

interface RoomPlayerWithProfile extends RoomPlayer {
  profile: { id: string; username: string; avatar_url: string | null; chips: number }
}

interface GameRoomProps {
  room: RoomWithHost
  profile: Profile
  roomPlayers: RoomPlayerWithProfile[]
  initialGameState: GameState | null
}

export function GameRoom({ room, profile, roomPlayers, initialGameState }: GameRoomProps) {
  const [gameState, setGameState] = useState<GameState | null>(initialGameState)
  const [players, setPlayers] = useState(roomPlayers)
  const [showBuyIn, setShowBuyIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Check if current user is in the room
  const currentPlayer = players.find(p => p.player_id === profile.id)
  const isHost = room.host_id === profile.id
  const isPlaying = gameState?.phase && gameState.phase !== 'waiting'
  const isMyTurn = gameState?.current_player_id === profile.id

  // Show buy-in dialog if not in room
  useEffect(() => {
    if (!currentPlayer) {
      setShowBuyIn(true)
    }
  }, [currentPlayer])

  const handleJoinRoom = async (buyIn: number) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/game/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, buyIn }),
      })
      const data = await res.json()
      if (data.success) {
        setShowBuyIn(false)
        router.refresh()
      } else {
        alert(data.error || 'Failed to join room')
      }
    } catch {
      alert('Failed to join room')
    }
    setIsLoading(false)
  }

  const handleStartGame = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id }),
      })
      const data = await res.json()
      if (data.success) {
        router.refresh()
      } else {
        alert(data.error || 'Failed to start game')
      }
    } catch {
      alert('Failed to start game')
    }
    setIsLoading(false)
  }

  const handleAction = async (action: string, amount?: number) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/game/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: room.id, action, amount }),
      })
      const data = await res.json()
      if (data.success) {
        setGameState(data.gameState)
      } else {
        alert(data.error || 'Invalid action')
      }
    } catch {
      alert('Failed to process action')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <GameHeader 
        room={room} 
        profile={profile}
        isHost={isHost}
        canStart={isHost && !isPlaying && players.length >= 2}
        onStartGame={handleStartGame}
        isLoading={isLoading}
      />

      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-w-[1600px] mx-auto w-full">
        {/* Game Area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Poker Table */}
          <div className="flex-1 min-h-[400px] lg:min-h-[500px]">
            <PokerTable
              players={players}
              gameState={gameState}
              currentPlayerId={profile.id}
              maxPlayers={room.max_players}
            />
          </div>

          {/* Betting Controls */}
          {currentPlayer && isPlaying && (
            <BettingControls
              gameState={gameState!}
              playerId={profile.id}
              isMyTurn={isMyTurn}
              onAction={handleAction}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="w-full lg:w-80">
          <GameChat roomId={room.id} profile={profile} />
        </div>
      </main>

      {/* Buy-in Dialog */}
      <BuyInDialog
        open={showBuyIn}
        onOpenChange={setShowBuyIn}
        room={room}
        profile={profile}
        onJoin={handleJoinRoom}
        isLoading={isLoading}
      />
    </div>
  )
}
