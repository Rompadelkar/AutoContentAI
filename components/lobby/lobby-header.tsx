'use client'

import Link from 'next/link'
import { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spade, LogOut, User, Trophy, Users, Coins } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface LobbyHeaderProps {
  profile: Profile
}

export function LobbyHeader({ profile }: LobbyHeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const formatChips = (chips: number) => {
    if (chips >= 1000000) return `${(chips / 1000000).toFixed(1)}M`
    if (chips >= 1000) return `${(chips / 1000).toFixed(1)}K`
    return chips.toString()
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/lobby" className="flex items-center gap-2">
          <Spade className="h-8 w-8 text-primary fill-primary" />
          <span className="text-xl font-bold text-foreground hidden sm:inline">All-In Poker</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link href="/leaderboard">
            <Button variant="ghost" size="sm">
              <Trophy className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Button>
          </Link>
          <Link href="/friends">
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Friends</span>
            </Button>
          </Link>
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          {/* Chips Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <Coins className="h-4 w-4 text-primary" />
            <span className="font-semibold text-primary">{formatChips(profile.chips)}</span>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {profile.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback>{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{profile.username}</span>
                  <span className="text-xs text-muted-foreground">{formatChips(profile.chips)} chips</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
