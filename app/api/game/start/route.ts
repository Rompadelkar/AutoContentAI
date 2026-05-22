import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { initializeHand } from '@/lib/poker/game-logic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId } = await request.json()

    // Get room details
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Check if user is the host
    if (room.host_id !== user.id) {
      return NextResponse.json({ error: 'Only the host can start the game' }, { status: 403 })
    }

    // Get players in room
    const { data: roomPlayers, error: playersError } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_active', true)

    if (playersError || !roomPlayers || roomPlayers.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 players to start' }, { status: 400 })
    }

    // Check for existing game state
    const { data: existingGame } = await supabase
      .from('game_state')
      .select('id')
      .eq('room_id', roomId)
      .single()

    // Create game players array
    const gamePlayers = roomPlayers.map(rp => ({
      id: rp.player_id,
      seatNumber: rp.seat_number,
      chips: rp.chips_in_game,
    }))

    // Initialize the hand (dealer is seat 0 for first hand)
    const dealerSeat = gamePlayers[0].seatNumber
    const gameState = initializeHand(
      roomId,
      gamePlayers,
      dealerSeat,
      room.small_blind,
      room.big_blind
    )

    if (existingGame) {
      // Update existing game state
      const { error: updateError } = await supabase
        .from('game_state')
        .update({
          deck: gameState.deck,
          community_cards: gameState.community_cards,
          player_hands: gameState.player_hands,
          pot: gameState.pot,
          side_pots: gameState.side_pots,
          current_bet: gameState.current_bet,
          current_player_id: gameState.current_player_id,
          dealer_seat: gameState.dealer_seat,
          phase: gameState.phase,
          player_states: gameState.player_states,
          last_action: null,
          turn_started_at: gameState.turn_started_at,
          hand_number: gameState.hand_number,
          updated_at: new Date().toISOString(),
        })
        .eq('room_id', roomId)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update game state' }, { status: 500 })
      }
    } else {
      // Create new game state
      const { error: createError } = await supabase
        .from('game_state')
        .insert({
          room_id: roomId,
          deck: gameState.deck,
          community_cards: gameState.community_cards,
          player_hands: gameState.player_hands,
          pot: gameState.pot,
          side_pots: gameState.side_pots,
          current_bet: gameState.current_bet,
          current_player_id: gameState.current_player_id,
          dealer_seat: gameState.dealer_seat,
          phase: gameState.phase,
          player_states: gameState.player_states,
          last_action: null,
          turn_started_at: gameState.turn_started_at,
          hand_number: gameState.hand_number,
        })

      if (createError) {
        return NextResponse.json({ error: 'Failed to create game state' }, { status: 500 })
      }
    }

    // Update room status
    await supabase
      .from('rooms')
      .update({ status: 'playing' })
      .eq('id', roomId)

    // TODO: Trigger Pusher event for real-time update

    return NextResponse.json({ 
      success: true,
      message: 'Game started'
    })
  } catch (error) {
    console.error('Start game error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
