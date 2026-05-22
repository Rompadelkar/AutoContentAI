'use client'

import { useState } from 'react'
import { Profile, Room } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Lock, Users, Coins } from 'lucide-react'

interface RoomWithHost extends Room {
  host: { id: string; username: string; avatar_url: string | null }
  room_players: { count: number }[]
}

interface CreateRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile
  onRoomCreated: (room: RoomWithHost) => void
}

export function CreateRoomDialog({ open, onOpenChange, profile, onRoomCreated }: CreateRoomDialogProps) {
  const [name, setName] = useState(`${profile.username}'s Table`)
  const [isPrivate, setIsPrivate] = useState(false)
  const [maxPlayers, setMaxPlayers] = useState('6')
  const [blinds, setBlinds] = useState('10/20')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const blindsOptions = [
    { value: '10/20', small: 10, big: 20, minBuy: 200, maxBuy: 2000 },
    { value: '25/50', small: 25, big: 50, minBuy: 500, maxBuy: 5000 },
    { value: '50/100', small: 50, big: 100, minBuy: 1000, maxBuy: 10000 },
    { value: '100/200', small: 100, big: 200, minBuy: 2000, maxBuy: 20000 },
    { value: '250/500', small: 250, big: 500, minBuy: 5000, maxBuy: 50000 },
  ]

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleCreate = async () => {
    setIsCreating(true)
    setError(null)

    const selectedBlinds = blindsOptions.find(b => b.value === blinds) || blindsOptions[0]
    
    if (profile.chips < selectedBlinds.minBuy) {
      setError(`You need at least ${selectedBlinds.minBuy} chips to create this room`)
      setIsCreating(false)
      return
    }

    const supabase = createClient()
    const roomCode = isPrivate ? generateRoomCode() : null

    const { data: room, error: createError } = await supabase
      .from('rooms')
      .insert({
        name,
        host_id: profile.id,
        is_private: isPrivate,
        room_code: roomCode,
        min_buy_in: selectedBlinds.minBuy,
        max_buy_in: selectedBlinds.maxBuy,
        small_blind: selectedBlinds.small,
        big_blind: selectedBlinds.big,
        max_players: parseInt(maxPlayers),
        current_players: 0,
        status: 'waiting',
      })
      .select()
      .single()

    if (createError) {
      setError(createError.message)
      setIsCreating(false)
      return
    }

    // Add the room with host info
    const roomWithHost: RoomWithHost = {
      ...room,
      host: {
        id: profile.id,
        username: profile.username,
        avatar_url: profile.avatar_url,
      },
      room_players: [{ count: 0 }],
    }

    onRoomCreated(roomWithHost)
    onOpenChange(false)
    setIsCreating(false)
  }

  const selectedBlinds = blindsOptions.find(b => b.value === blinds) || blindsOptions[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create Room</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set up your poker table
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Room Name */}
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Poker Room"
              maxLength={30}
              className="bg-input border-border"
            />
          </div>

          {/* Private Room Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Private Room</p>
                <p className="text-xs text-muted-foreground">Only players with code can join</p>
              </div>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>

          {/* Max Players */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Max Players
            </Label>
            <Select value={maxPlayers} onValueChange={setMaxPlayers}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Players (Heads Up)</SelectItem>
                <SelectItem value="3">3 Players</SelectItem>
                <SelectItem value="4">4 Players</SelectItem>
                <SelectItem value="5">5 Players</SelectItem>
                <SelectItem value="6">6 Players</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Blinds */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Blinds
            </Label>
            <Select value={blinds} onValueChange={setBlinds}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {blindsOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.value} (Buy-in: {opt.minBuy.toLocaleString()}-{opt.maxBuy.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
            <p className="text-foreground">
              Min buy-in: <strong>{selectedBlinds.minBuy.toLocaleString()}</strong> chips
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              You have {profile.chips.toLocaleString()} chips
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </p>
          )}

          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={isCreating || !name.trim()}
          >
            {isCreating ? 'Creating...' : 'Create Room'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
