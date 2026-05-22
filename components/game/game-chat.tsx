'use client'

import { useState, useRef, useEffect } from 'react'
import { Profile } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Send, Smile } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import useSWR from 'swr'

interface ChatMessage {
  id: string
  room_id: string
  player_id: string
  message: string
  is_emoji: boolean
  created_at: string
  profile?: { username: string; avatar_url: string | null }
}

interface GameChatProps {
  roomId: string
  profile: Profile
}

const QUICK_EMOJIS = ['👍', '👎', '😀', '😢', '🎉', '🔥', '💰', '🃏']

export function GameChat({ roomId, profile }: GameChatProps) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch messages
  const { data: messages, mutate } = useSWR<ChatMessage[]>(
    `/chat/${roomId}`,
    async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profile:profiles(username, avatar_url)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100)
      return data || []
    },
    { refreshInterval: 3000 }
  )

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (text: string, isEmoji: boolean = false) => {
    if (!text.trim()) return
    setIsSending(true)

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        player_id: profile.id,
        message: text.trim(),
        is_emoji: isEmoji,
      })

    if (!error) {
      setMessage('')
      mutate()
    }
    setIsSending(false)
    setShowEmojis(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend(message)
  }

  return (
    <Card className="bg-card border-border h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="space-y-3 py-4">
            {(!messages || messages.length === 0) && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No messages yet. Say hi!
              </p>
            )}
            {messages?.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                isOwn={msg.player_id === profile.id}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Quick Emojis */}
        {showEmojis && (
          <div className="flex items-center gap-1 px-4 py-2 border-t border-border">
            {QUICK_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="text-lg p-1 h-8 w-8"
                onClick={() => handleSend(emoji, true)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowEmojis(!showEmojis)}
            >
              <Smile className="h-4 w-4" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              maxLength={500}
              className="flex-1 bg-input border-border"
            />
            <Button type="submit" size="icon" disabled={isSending || !message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function ChatMessageItem({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  const timeStr = new Date(message.created_at).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  if (message.is_emoji) {
    return (
      <div className={`flex items-center gap-2 ${isOwn ? 'justify-end' : ''}`}>
        {!isOwn && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={message.profile?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">
              {message.profile?.username?.slice(0, 2).toUpperCase() || '??'}
            </AvatarFallback>
          </Avatar>
        )}
        <span className="text-2xl">{message.message}</span>
      </div>
    )
  }

  return (
    <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-6 w-6 shrink-0">
        <AvatarImage src={message.profile?.avatar_url || undefined} />
        <AvatarFallback className="text-xs">
          {message.profile?.username?.slice(0, 2).toUpperCase() || '??'}
        </AvatarFallback>
      </Avatar>
      <div className={`flex flex-col ${isOwn ? 'items-end' : ''}`}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{isOwn ? 'You' : message.profile?.username}</span>
          <span>{timeStr}</span>
        </div>
        <p className={`text-sm px-3 py-1.5 rounded-lg max-w-[200px] break-words ${
          isOwn ? 'bg-primary text-primary-foreground' : 'bg-secondary'
        }`}>
          {message.message}
        </p>
      </div>
    </div>
  )
}
