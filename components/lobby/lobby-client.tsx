'use client'

import { useState } from 'react'
import { Profile, Room } from '@/lib/types'
import { LobbyHeader } from './lobby-header'
import { RoomList } from './room-list'
import { CreateRoomDialog } from './create-room-dialog'
import { JoinPrivateRoomDialog } from './join-private-room-dialog'
import { ProfilePanel } from './profile-panel'
import { Button } from '@/components/ui/button'
import { Plus, Key, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RoomWithHost extends Room {
  host: { id: string; username: string; avatar_url: string | null }
  room_players: { count: number }[]
}

interface LobbyClientProps {
  profile: Profile
  initialRooms: RoomWithHost[]
}

export function LobbyClient({ profile, initialRooms }: LobbyClientProps) {
  const [rooms, setRooms] = useState(initialRooms)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isJoinPrivateOpen, setIsJoinPrivateOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleRoomCreated = (newRoom: RoomWithHost) => {
    setRooms([newRoom, ...rooms])
    router.push(`/room/${newRoom.id}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LobbyHeader profile={profile} />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Panel - Left Sidebar on Desktop */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <ProfilePanel profile={profile} />
          </div>

          {/* Room List - Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2 space-y-4">
            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-foreground">Game Rooms</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsJoinPrivateOpen(true)}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Join Private
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Room
                </Button>
              </div>
            </div>

            {/* Rooms */}
            <RoomList rooms={rooms} currentUserId={profile.id} />
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <CreateRoomDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        profile={profile}
        onRoomCreated={handleRoomCreated}
      />
      <JoinPrivateRoomDialog
        open={isJoinPrivateOpen}
        onOpenChange={setIsJoinPrivateOpen}
      />
    </div>
  )
}
