'use client'

import { useState } from 'react'
import { GameState, ActionType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { getAvailableActions } from '@/lib/poker/game-logic'
import { cn } from '@/lib/utils'

interface BettingControlsProps {
  gameState: GameState
  playerId: string
  isMyTurn: boolean
  onAction: (action: ActionType, amount?: number) => void
  isLoading: boolean
}

export function BettingControls({ gameState, playerId, isMyTurn, onAction, isLoading }: BettingControlsProps) {
  const playerState = gameState.player_states[playerId]
  const availableActions = getAvailableActions(gameState)
  
  const [betAmount, setBetAmount] = useState(gameState.current_bet * 2)
  
  const minBet = Math.max(gameState.current_bet * 2, gameState.current_bet + 1)
  const maxBet = playerState?.chips || 0
  const callAmount = gameState.current_bet - (playerState?.bet || 0)

  const handleBetChange = (value: number[]) => {
    setBetAmount(value[0])
  }

  const presetBets = [
    { label: '1/2 Pot', value: Math.floor(gameState.pot / 2) },
    { label: '3/4 Pot', value: Math.floor(gameState.pot * 0.75) },
    { label: 'Pot', value: gameState.pot },
  ].filter(p => p.value >= minBet && p.value <= maxBet)

  if (!isMyTurn) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 text-center">
        <p className="text-muted-foreground">
          {playerState?.folded ? "You've folded this hand" : "Waiting for your turn..."}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Your turn</p>
        <p className="text-sm">
          Your chips: <span className="font-bold text-primary">{playerState?.chips.toLocaleString()}</span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {availableActions.includes('fold') && (
          <Button
            variant="destructive"
            onClick={() => onAction('fold')}
            disabled={isLoading}
            className="flex-1 min-w-[80px]"
          >
            Fold
          </Button>
        )}
        
        {availableActions.includes('check') && (
          <Button
            variant="secondary"
            onClick={() => onAction('check')}
            disabled={isLoading}
            className="flex-1 min-w-[80px]"
          >
            Check
          </Button>
        )}
        
        {availableActions.includes('call') && (
          <Button
            variant="secondary"
            onClick={() => onAction('call')}
            disabled={isLoading}
            className="flex-1 min-w-[80px]"
          >
            Call {callAmount.toLocaleString()}
          </Button>
        )}
        
        {(availableActions.includes('bet') || availableActions.includes('raise')) && (
          <Button
            onClick={() => onAction(availableActions.includes('bet') ? 'bet' : 'raise', betAmount)}
            disabled={isLoading || betAmount > maxBet}
            className="flex-1 min-w-[100px]"
          >
            {availableActions.includes('bet') ? 'Bet' : 'Raise'} {betAmount.toLocaleString()}
          </Button>
        )}
        
        {availableActions.includes('all-in') && (
          <Button
            variant="default"
            onClick={() => onAction('all-in')}
            disabled={isLoading}
            className="flex-1 min-w-[100px] bg-primary hover:bg-primary/90"
          >
            All-In ({maxBet.toLocaleString()})
          </Button>
        )}
      </div>

      {/* Bet Slider */}
      {(availableActions.includes('bet') || availableActions.includes('raise')) && maxBet > minBet && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Min: {minBet.toLocaleString()}</span>
            <span>Max: {maxBet.toLocaleString()}</span>
          </div>
          <Slider
            value={[betAmount]}
            onValueChange={handleBetChange}
            min={minBet}
            max={maxBet}
            step={gameState.current_bet || 10}
            className="w-full"
          />
          
          {/* Preset Bet Buttons */}
          {presetBets.length > 0 && (
            <div className="flex gap-2">
              {presetBets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setBetAmount(preset.value)}
                  className={cn(
                    "flex-1 text-xs",
                    betAmount === preset.value && "border-primary"
                  )}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
