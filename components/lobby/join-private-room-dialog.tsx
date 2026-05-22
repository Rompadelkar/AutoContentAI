'use client'

import { useState } from 'react'
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
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Key } from 'lucide-react'

interface JoinPrivateRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinPrivateRoomDialog({ open, onOpenChange }: JoinPrivateRoomDialogProps) {
  const [code, setCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleJoin = async () => {
    if (!code.trim()) return
    
    setIsJoining(true)
    setError(null)

    const supabase = createClient()
    
    const { data: room, error: findError } = await supabase
      .from('rooms')
      .select('id, status, current_players, max_players')
      .eq('room_code', code.toUpperCase())
      .single()

    if (findError || !room) {
      setError('Room not found. Please check the code and try again.')
      setIsJoining(false)
      return
    }

    if (room.status === 'finished') {
      setError('This game has already ended.')
      setIsJoining(false)
      return
    }

    if (room.current_players >= room.max_players) {
      setError('This room is full.')
      setIsJoining(false)
      return
    }

    router.push(`/room/${room.id}`)
    onOpenChange(false)
    setIsJoining(false)
    setCode('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Join Private Room
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the room code to join a private game
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-code">Room Code</Label>
            <Input
              id="room-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="bg-input border-border text-center text-2xl tracking-widest font-mono"
              autoComplete="off"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </p>
          )}

          <Button
            className="w-full"
            onClick={handleJoin}
            disabled={isJoining || code.length < 6}
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
