'use client'

import { useState } from 'react'
import { Profile, Friendship } from '@/lib/types'
import { LobbyHeader } from '@/components/lobby/lobby-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, UserPlus, Clock, Check, X, Search, Coins } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface FriendProfile {
  id: string
  username: string
  avatar_url: string | null
  chips: number
}

interface FriendshipWithProfiles extends Friendship {
  requester: FriendProfile
  addressee: FriendProfile
}

interface FriendsClientProps {
  profile: Profile
  friendships: FriendshipWithProfiles[]
}

export function FriendsClient({ profile, friendships }: FriendsClientProps) {
  const [searchUsername, setSearchUsername] = useState('')
  const [searchResult, setSearchResult] = useState<FriendProfile | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Categorize friendships
  const acceptedFriends = friendships
    .filter(f => f.status === 'accepted')
    .map(f => f.requester_id === profile.id ? f.addressee : f.requester)

  const pendingReceived = friendships
    .filter(f => f.status === 'pending' && f.addressee_id === profile.id)

  const pendingSent = friendships
    .filter(f => f.status === 'pending' && f.requester_id === profile.id)

  const handleSearch = async () => {
    if (!searchUsername.trim()) return
    setIsSearching(true)
    setError(null)
    setSearchResult(null)

    const { data, error: searchError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, chips')
      .ilike('username', searchUsername)
      .neq('id', profile.id)
      .limit(1)
      .single()

    if (searchError || !data) {
      setError('Player not found')
    } else {
      setSearchResult(data)
    }
    setIsSearching(false)
  }

  const handleSendRequest = async (toUserId: string) => {
    setIsProcessing(true)
    setError(null)

    const { error: insertError } = await supabase
      .from('friendships')
      .insert({
        requester_id: profile.id,
        addressee_id: toUserId,
        status: 'pending',
      })

    if (insertError) {
      if (insertError.code === '23505') {
        setError('Friend request already exists')
      } else {
        setError('Failed to send request')
      }
    } else {
      router.refresh()
      setSearchResult(null)
      setSearchUsername('')
    }
    setIsProcessing(false)
  }

  const handleAccept = async (friendshipId: string) => {
    setIsProcessing(true)
    await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)
    router.refresh()
    setIsProcessing(false)
  }

  const handleDecline = async (friendshipId: string) => {
    setIsProcessing(true)
    await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)
    router.refresh()
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LobbyHeader profile={profile} />
      
      <main className="flex-1 max-w-4xl mx-auto w-full p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Friends</h1>
          </div>

          {/* Add Friend */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add Friend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by username..."
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-input border-border"
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              {searchResult && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={searchResult.avatar_url || undefined} />
                      <AvatarFallback>{searchResult.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{searchResult.username}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        {searchResult.chips.toLocaleString()} chips
                      </p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleSendRequest(searchResult.id)}
                    disabled={isProcessing}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Friends Tabs */}
          <Tabs defaultValue="friends">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Friends ({acceptedFriends.length})
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Requests ({pendingReceived.length})
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Sent ({pendingSent.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="friends" className="mt-4">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  {acceptedFriends.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No friends yet. Add some!</p>
                  ) : (
                    <div className="space-y-2">
                      {acceptedFriends.map((friend) => (
                        <FriendRow key={friend.id} friend={friend} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests" className="mt-4">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  {pendingReceived.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No pending requests</p>
                  ) : (
                    <div className="space-y-2">
                      {pendingReceived.map((friendship) => (
                        <div key={friendship.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={friendship.requester.avatar_url || undefined} />
                              <AvatarFallback>{friendship.requester.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{friendship.requester.username}</p>
                              <p className="text-xs text-muted-foreground">Wants to be friends</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleAccept(friendship.id)} disabled={isProcessing}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDecline(friendship.id)} disabled={isProcessing}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sent" className="mt-4">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  {pendingSent.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No pending requests sent</p>
                  ) : (
                    <div className="space-y-2">
                      {pendingSent.map((friendship) => (
                        <div key={friendship.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={friendship.addressee.avatar_url || undefined} />
                              <AvatarFallback>{friendship.addressee.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{friendship.addressee.username}</p>
                              <Badge variant="secondary" className="text-xs">Pending</Badge>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleDecline(friendship.id)} disabled={isProcessing}>
                            Cancel
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

function FriendRow({ friend }: { friend: FriendProfile }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={friend.avatar_url || undefined} />
          <AvatarFallback className="bg-secondary">
            {friend.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{friend.username}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Coins className="h-3 w-3" />
            {friend.chips.toLocaleString()} chips
          </p>
        </div>
      </div>
    </div>
  )
}
