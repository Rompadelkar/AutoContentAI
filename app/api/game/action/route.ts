import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processAction, getAvailableActions } from '@/lib/poker/game-logic'
import { ActionType, GameState } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId, action, amount } = await request.json() as {
      roomId: string
      action: ActionType
      amount?: number
    }

    // Get current game state
    const { data: gameState, error: gameError } = await supabase
      .from('game_state')
      .select('*')
      .eq('room_id', roomId)
      .single()

    if (gameError || !gameState) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Check if it's the player's turn
    if (gameState.current_player_id !== user.id) {
      return NextResponse.json({ error: 'Not your turn' }, { status: 400 })
    }

    // Validate action
    const availableActions = getAvailableActions(gameState as unknown as GameState)
    if (!availableActions.includes(action)) {
      return NextResponse.json({ 
        error: 'Invalid action',
        availableActions 
      }, { status: 400 })
    }

    // Process the action
    const newState = processAction(gameState as unknown as GameState, user.id, action, amount)

    // Update game state in database
    const { error: updateError } = await supabase
      .from('game_state')
      .update({
        current_player_id: newState.current_player_id,
        current_bet: newState.current_bet,
        pot: newState.pot,
        phase: newState.phase,
        player_states: newState.player_states,
        last_action: newState.last_action,
        community_cards: newState.community_cards,
        deck: newState.deck,
        turn_started_at: newState.turn_started_at,
        updated_at: newState.updated_at,
      })
      .eq('room_id', roomId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update game state' }, { status: 500 })
    }

    // TODO: Trigger Pusher event for real-time update

    return NextResponse.json({ 
      success: true,
      gameState: newState
    })
  } catch (error) {
    console.error('Game action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
