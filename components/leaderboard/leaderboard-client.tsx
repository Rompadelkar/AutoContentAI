'use client'

import { useState } from 'react'
import { Profile } from '@/lib/types'
import { LobbyHeader } from '@/components/lobby/lobby-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Trophy, Coins, Target, Medal } from 'lucide-react'

interface LeaderboardPlayer {
  id: string
  username: string
  avatar_url: string | null
  chips: number
  games_won: number
  games_played: number
}

interface LeaderboardClientProps {
  profile: Profile
  topByChips: LeaderboardPlayer[]
  topByWins: LeaderboardPlayer[]
}

export function LeaderboardClient({ profile, topByChips, topByWins }: LeaderboardClientProps) {
  const [tab, setTab] = useState('chips')

  const getRankBadge = (index: number) => {
    if (index === 0) return <Medal className="h-5 w-5 text-yellow-500" />
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />
    if (index === 2) return <Medal className="h-5 w-5 text-amber-700" />
    return <span className="text-sm text-muted-foreground w-5 text-center">{index + 1}</span>
  }

  const formatChips = (chips: number) => {
    if (chips >= 1000000) return `${(chips / 1000000).toFixed(1)}M`
    if (chips >= 1000) return `${(chips / 1000).toFixed(1)}K`
    return chips.toString()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LobbyHeader profile={profile} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chips" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Richest Players
              </TabsTrigger>
              <TabsTrigger value="wins" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Most Wins
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chips" className="mt-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    Top Players by Chips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topByChips.map((player, index) => (
                      <LeaderboardRow
                        key={player.id}
                        player={player}
                        rank={index}
                        rankBadge={getRankBadge(index)}
                        isCurrentUser={player.id === profile.id}
                        valueDisplay={formatChips(player.chips)}
                        valueIcon={<Coins className="h-4 w-4 text-primary" />}
                      />
                    ))}
                    {topByChips.length === 0 && (
                      <p className="text-center py-8 text-muted-foreground">No players yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wins" className="mt-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-accent" />
                    Top Players by Wins
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topByWins.map((player, index) => (
                      <LeaderboardRow
                        key={player.id}
                        player={player}
                        rank={index}
                        rankBadge={getRankBadge(index)}
                        isCurrentUser={player.id === profile.id}
                        valueDisplay={`${player.games_won} wins`}
                        valueIcon={<Trophy className="h-4 w-4 text-accent" />}
                      />
                    ))}
                    {topByWins.length === 0 && (
                      <p className="text-center py-8 text-muted-foreground">No players yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

interface LeaderboardRowProps {
  player: LeaderboardPlayer
  rank: number
  rankBadge: React.ReactNode
  isCurrentUser: boolean
  valueDisplay: string
  valueIcon: React.ReactNode
}

function LeaderboardRow({ player, rankBadge, isCurrentUser, valueDisplay, valueIcon }: LeaderboardRowProps) {
  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
      isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/50'
    }`}>
      {/* Rank */}
      <div className="w-8 flex items-center justify-center">
        {rankBadge}
      </div>

      {/* Player Info */}
      <Avatar className="h-10 w-10">
        <AvatarImage src={player.avatar_url || undefined} />
        <AvatarFallback className="bg-secondary">
          {player.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate flex items-center gap-2">
          {player.username}
          {isCurrentUser && <Badge variant="outline" className="text-xs">You</Badge>}
        </p>
        <p className="text-xs text-muted-foreground">
          {player.games_played} games played
        </p>
      </div>

      {/* Value */}
      <div className="flex items-center gap-2">
        {valueIcon}
        <span className="font-bold text-foreground">{valueDisplay}</span>
      </div>
    </div>
  )
}
