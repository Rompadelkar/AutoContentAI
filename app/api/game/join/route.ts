import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId, buyIn } = await request.json()

    // Get room details
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Check if room is full
    if (room.current_players >= room.max_players) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 })
    }

    // Validate buy-in
    if (buyIn < room.min_buy_in || buyIn > room.max_buy_in) {
      return NextResponse.json({ 
        error: `Buy-in must be between ${room.min_buy_in} and ${room.max_buy_in}` 
      }, { status: 400 })
    }

    // Get player profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if player has enough chips
    if (profile.chips < buyIn) {
      return NextResponse.json({ error: 'Not enough chips' }, { status: 400 })
    }

    // Check if already in room
    const { data: existingPlayer } = await supabase
      .from('room_players')
      .select('*')
      .eq('room_id', roomId)
      .eq('player_id', user.id)
      .single()

    if (existingPlayer) {
      return NextResponse.json({ 
        success: true, 
        message: 'Already in room',
        seatNumber: existingPlayer.seat_number 
      })
    }

    // Find available seat
    const { data: occupiedSeats } = await supabase
      .from('room_players')
      .select('seat_number')
      .eq('room_id', roomId)
      .eq('is_active', true)

    const takenSeats = new Set(occupiedSeats?.map(s => s.seat_number) || [])
    let availableSeat = -1
    for (let i = 0; i < room.max_players; i++) {
      if (!takenSeats.has(i)) {
        availableSeat = i
        break
      }
    }

    if (availableSeat === -1) {
      return NextResponse.json({ error: 'No seats available' }, { status: 400 })
    }

    // Deduct chips from profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ chips: profile.chips - buyIn })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update chips' }, { status: 500 })
    }

    // Add player to room
    const { error: joinError } = await supabase
      .from('room_players')
      .insert({
        room_id: roomId,
        player_id: user.id,
        seat_number: availableSeat,
        chips_in_game: buyIn,
        is_active: true,
      })

    if (joinError) {
      // Refund chips if join failed
      await supabase
        .from('profiles')
        .update({ chips: profile.chips })
        .eq('id', user.id)
      return NextResponse.json({ error: 'Failed to join room' }, { status: 500 })
    }

    // Update room player count
    await supabase
      .from('rooms')
      .update({ current_players: room.current_players + 1 })
      .eq('id', roomId)

    return NextResponse.json({ 
      success: true, 
      seatNumber: availableSeat,
      chipsInGame: buyIn 
    })
  } catch (error) {
    console.error('Join room error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
