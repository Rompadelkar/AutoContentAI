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
import { Slider } from '@/components/ui/slider'
import { Coins } from 'lucide-react'

interface RoomWithHost extends Room {
  host: { id: string; username: string; avatar_url: string | null }
}

interface BuyInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room: RoomWithHost
  profile: Profile
  onJoin: (buyIn: number) => void
  isLoading: boolean
}

export function BuyInDialog({ open, onOpenChange, room, profile, onJoin, isLoading }: BuyInDialogProps) {
  const [buyIn, setBuyIn] = useState(room.min_buy_in)
  
  const maxAffordable = Math.min(room.max_buy_in, profile.chips)
  const canAfford = profile.chips >= room.min_buy_in

  const handleBuyInChange = (value: number[]) => {
    setBuyIn(value[0])
  }

  const presetAmounts = [
    { label: 'Min', value: room.min_buy_in },
    { label: 'Half', value: Math.floor((room.min_buy_in + maxAffordable) / 2) },
    { label: 'Max', value: maxAffordable },
  ].filter(p => p.value >= room.min_buy_in && p.value <= maxAffordable)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Take Your Seat</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose how many chips to bring to the table
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Player Balance */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <span className="text-sm text-muted-foreground">Your Balance</span>
            <span className="font-bold text-primary flex items-center gap-1">
              <Coins className="h-4 w-4" />
              {profile.chips.toLocaleString()}
            </span>
          </div>

          {/* Room Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Blinds</p>
              <p className="font-medium">{room.small_blind}/{room.big_blind}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Buy-in Range</p>
              <p className="font-medium">{room.min_buy_in.toLocaleString()} - {room.max_buy_in.toLocaleString()}</p>
            </div>
          </div>

          {canAfford ? (
            <>
              {/* Buy-in Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Buy-in Amount</span>
                  <span className="text-2xl font-bold text-primary">{buyIn.toLocaleString()}</span>
                </div>
                
                <Slider
                  value={[buyIn]}
                  onValueChange={handleBuyInChange}
                  min={room.min_buy_in}
                  max={maxAffordable}
                  step={room.small_blind}
                  className="w-full"
                />

                {/* Preset Buttons */}
                <div className="flex gap-2">
                  {presetAmounts.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outline"
                      size="sm"
                      onClick={() => setBuyIn(preset.value)}
                      className="flex-1"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => onJoin(buyIn)}
                disabled={isLoading}
              >
                {isLoading ? 'Joining...' : `Buy In for ${buyIn.toLocaleString()}`}
              </Button>
            </>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-destructive">
                You need at least {room.min_buy_in.toLocaleString()} chips to join this table.
              </p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Go Back
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
