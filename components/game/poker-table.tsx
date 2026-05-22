'use client'

import { GameState, RoomPlayer, Card } from '@/lib/types'
import { PlayerSeat } from './player-seat'
import { CommunityCards } from './community-cards'
import { PotDisplay } from './pot-display'

interface RoomPlayerWithProfile extends RoomPlayer {
  profile: { id: string; username: string; avatar_url: string | null; chips: number }
}

interface PokerTableProps {
  players: RoomPlayerWithProfile[]
  gameState: GameState | null
  currentPlayerId: string
  maxPlayers: number
}

// Seat positions around an oval table (percentage based)
const SEAT_POSITIONS: Record<number, { top: string; left: string }[]> = {
  2: [
    { top: '75%', left: '50%' },  // Bottom center
    { top: '15%', left: '50%' },  // Top center
  ],
  3: [
    { top: '75%', left: '50%' },  // Bottom center
    { top: '30%', left: '15%' },  // Top left
    { top: '30%', left: '85%' },  // Top right
  ],
  4: [
    { top: '75%', left: '50%' },  // Bottom center
    { top: '50%', left: '10%' },  // Left
    { top: '15%', left: '50%' },  // Top center
    { top: '50%', left: '90%' },  // Right
  ],
  5: [
    { top: '75%', left: '50%' },  // Bottom center
    { top: '60%', left: '10%' },  // Bottom left
    { top: '25%', left: '20%' },  // Top left
    { top: '25%', left: '80%' },  // Top right
    { top: '60%', left: '90%' },  // Bottom right
  ],
  6: [
    { top: '75%', left: '50%' },  // Bottom center
    { top: '60%', left: '10%' },  // Bottom left
    { top: '25%', left: '15%' },  // Top left
    { top: '15%', left: '50%' },  // Top center
    { top: '25%', left: '85%' },  // Top right
    { top: '60%', left: '90%' },  // Bottom right
  ],
}

export function PokerTable({ players, gameState, currentPlayerId, maxPlayers }: PokerTableProps) {
  const positions = SEAT_POSITIONS[maxPlayers] || SEAT_POSITIONS[6]
  
  // Create seat array with player info
  const seats = positions.map((pos, index) => {
    const player = players.find(p => p.seat_number === index)
    const playerState = player && gameState?.player_states[player.player_id]
    const holeCards = player && gameState?.player_hands[player.player_id]
    
    return {
      position: pos,
      seatNumber: index,
      player,
      playerState,
      holeCards,
      isCurrentPlayer: player?.player_id === currentPlayerId,
      isActive: gameState?.current_player_id === player?.player_id,
    }
  })

  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center p-4">
      {/* Table Background */}
      <div className="poker-table absolute w-[90%] h-[70%] rounded-[50%] flex items-center justify-center">
        {/* Center Area - Community Cards & Pot */}
        <div className="flex flex-col items-center gap-4">
          {/* Community Cards */}
          {gameState && gameState.phase !== 'waiting' && gameState.phase !== 'preflop' && (
            <CommunityCards cards={gameState.community_cards} />
          )}
          
          {/* Pot */}
          {gameState && gameState.pot > 0 && (
            <PotDisplay pot={gameState.pot} />
          )}
          
          {/* Waiting State */}
          {(!gameState || gameState.phase === 'waiting') && (
            <div className="text-center text-muted-foreground">
              <p className="text-lg">Waiting for players...</p>
              <p className="text-sm">{players.length} player{players.length !== 1 ? 's' : ''} at the table</p>
            </div>
          )}
        </div>
      </div>

      {/* Player Seats */}
      {seats.map((seat) => (
        <div
          key={seat.seatNumber}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ top: seat.position.top, left: seat.position.left }}
        >
          <PlayerSeat
            seatNumber={seat.seatNumber}
            player={seat.player}
            playerState={seat.playerState}
            holeCards={seat.holeCards}
            isCurrentPlayer={seat.isCurrentPlayer}
            isActive={seat.isActive}
            showCards={seat.isCurrentPlayer || gameState?.phase === 'showdown'}
          />
        </div>
      ))}
    </div>
  )
}
