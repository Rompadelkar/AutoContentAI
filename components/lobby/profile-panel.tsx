'use client'

import { useState } from 'react'
import { Profile } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Coins, Trophy, Target, Gift, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ProfilePanelProps {
  profile: Profile
}

export function ProfilePanel({ profile }: ProfilePanelProps) {
  const [isClaiming, setIsClaiming] = useState(false)
  const router = useRouter()

  const canClaimDaily = () => {
    if (!profile.last_daily_reward) return true
    const lastClaim = new Date(profile.last_daily_reward)
    const now = new Date()
    return now.getTime() - lastClaim.getTime() >= 24 * 60 * 60 * 1000
  }

  const handleClaimDaily = async () => {
    if (!canClaimDaily()) return
    setIsClaiming(true)
    
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        chips: profile.chips + 1000,
        last_daily_reward: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (!error) {
      router.refresh()
    }
    setIsClaiming(false)
  }

  const winRate = profile.games_played > 0 
    ? Math.round((profile.games_won / profile.games_played) * 100) 
    : 0

  const formatChips = (chips: number) => {
    return chips.toLocaleString()
  }

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary text-lg">
                {profile.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{profile.username}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chips */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Balance</span>
            </div>
            <span className="text-xl font-bold text-primary">{formatChips(profile.chips)}</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatItem icon={<Target className="h-4 w-4" />} label="Games" value={profile.games_played} />
            <StatItem icon={<Trophy className="h-4 w-4" />} label="Wins" value={profile.games_won} />
            <StatItem icon={<TrendingUp className="h-4 w-4" />} label="Win Rate" value={`${winRate}%`} />
            <StatItem icon={<Coins className="h-4 w-4" />} label="Best Win" value={formatChips(profile.biggest_win)} />
          </div>

          {/* Win Rate Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Win Rate</span>
              <span className="text-foreground">{winRate}%</span>
            </div>
            <Progress value={winRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Daily Reward Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Daily Reward
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-3">
            <p className="text-2xl font-bold text-primary">+1,000</p>
            <p className="text-sm text-muted-foreground">Free chips every 24 hours</p>
            <Button
              className="w-full"
              disabled={!canClaimDaily() || isClaiming}
              onClick={handleClaimDaily}
            >
              {isClaiming ? 'Claiming...' : canClaimDaily() ? 'Claim Now' : 'Come Back Tomorrow'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}
