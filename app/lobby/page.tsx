import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LobbyClient } from '@/components/lobby/lobby-client'

export default async function LobbyPage() {
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

  // Get available rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select(`
      *,
      host:profiles!rooms_host_id_fkey(id, username, avatar_url),
      room_players(count)
    `)
    .in('status', ['waiting', 'playing'])
    .order('created_at', { ascending: false })

  return <LobbyClient profile={profile} initialRooms={rooms || []} />
}
