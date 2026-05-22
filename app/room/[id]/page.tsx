import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { GameRoom } from '@/components/game/game-room'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function RoomPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/login')
  }

  // Get room with host info
  const { data: room } = await supabase
    .from('rooms')
    .select(`
      *,
      host:profiles!rooms_host_id_fkey(id, username, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (!room) {
    notFound()
  }

  // Get players in room
  const { data: roomPlayers } = await supabase
    .from('room_players')
    .select(`
      *,
      profile:profiles(id, username, avatar_url, chips)
    `)
    .eq('room_id', id)
    .eq('is_active', true)

  // Get game state if exists
  const { data: gameState } = await supabase
    .from('game_state')
    .select('*')
    .eq('room_id', id)
    .single()

  return (
    <GameRoom
      room={room}
      profile={profile}
      roomPlayers={roomPlayers || []}
      initialGameState={gameState}
    />
  )
}
