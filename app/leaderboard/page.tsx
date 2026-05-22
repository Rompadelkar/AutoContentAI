import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LeaderboardClient } from '@/components/leaderboard/leaderboard-client'

export default async function LeaderboardPage() {
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

  // Get top players by chips
  const { data: topByChips } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, chips, games_won, games_played')
    .order('chips', { ascending: false })
    .limit(50)

  // Get top players by wins
  const { data: topByWins } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, chips, games_won, games_played')
    .order('games_won', { ascending: false })
    .limit(50)

  return (
    <LeaderboardClient 
      profile={profile}
      topByChips={topByChips || []}
      topByWins={topByWins || []}
    />
  )
}
