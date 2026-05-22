import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FriendsClient } from '@/components/friends/friends-client'

export default async function FriendsPage() {
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

  // Get friendships where user is requester or addressee
  const { data: friendships } = await supabase
    .from('friendships')
    .select(`
      *,
      requester:profiles!friendships_requester_id_fkey(id, username, avatar_url, chips),
      addressee:profiles!friendships_addressee_id_fkey(id, username, avatar_url, chips)
    `)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

  return (
    <FriendsClient 
      profile={profile}
      friendships={friendships || []}
    />
  )
}
