'use client'

import { Room } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Lock, Play, Coins, Crown } from 'lucide-react'
import Link from 'next/link'

interface RoomWithHost extends Room {
  host: { id: string; username: string; avatar_url: string | null }
  room_players: { count: number }[]
}

interface RoomListProps {
  rooms: RoomWithHost[]
  currentUserId: string
}

export function RoomList({ rooms, currentUserId }: RoomListProps) {
  const publicRooms = rooms.filter(r => !r.is_private)
  
  if (publicRooms.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Active Rooms</h3>
          <p className="text-muted-foreground mb-4">Be the first to create a room and start playing!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {publicRooms.map((room) => (
        <RoomCard key={room.id} room={room} isHost={room.host_id === currentUserId} />
      ))}
    </div>
  )
}

function RoomCard({ room, isHost }: { room: RoomWithHost; isHost: boolean }) {
  const playerCount = room.room_players[0]?.count || 0
  const isFull = playerCount >= room.max_players
  const isPlaying = room.status === 'playing'

  const formatBlinds = (small: number, big: number) => {
    return `${small}/${big}`
  }

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={room.host.avatar_url || undefined} />
              <AvatarFallback className="bg-secondary">
                {room.host.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {room.name}
                {room.is_private && <Lock className="h-4 w-4 text-muted-foreground" />}
              </CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Crown className="h-3 w-3" />
                {room.host.username}
                {isHost && <Badge variant="outline" className="ml-2 text-xs">You</Badge>}
              </p>
            </div>
          </div>
          <Badge variant={isPlaying ? 'default' : 'secondary'}>
            {isPlaying ? (
              <>
                <Play className="h-3 w-3 mr-1" />
                Playing
              </>
            ) : (
              'Waiting'
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {playerCount}/{room.max_players}
            </span>
            <span className="flex items-center gap-1">
              <Coins className="h-4 w-4" />
              {formatBlinds(room.small_blind, room.big_blind)}
            </span>
            <span>
              Buy-in: {room.min_buy_in.toLocaleString()}-{room.max_buy_in.toLocaleString()}
            </span>
          </div>
          <Button
            size="sm"
            disabled={isFull && !isPlaying}
            asChild
          >
            <Link href={`/room/${room.id}`}>
              {isFull ? 'Watch' : 'Join'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
