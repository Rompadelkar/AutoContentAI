'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Spade } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (username.length < 3 || username.length > 20) {
      setError('Username must be between 3 and 20 characters')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/lobby`,
          data: {
            username: username,
          },
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Spade className="h-10 w-10 text-primary fill-primary" />
              <h1 className="text-3xl font-bold text-foreground">All-In Poker</h1>
            </div>
            <p className="text-muted-foreground text-sm">Texas Hold&apos;em Multiplayer</p>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Join the Game</CardTitle>
              <CardDescription className="text-muted-foreground">
                Create your account and get 10,000 free chips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="username" className="text-foreground">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="PokerPro"
                      required
                      minLength={3}
                      maxLength={20}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="player@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password" className="text-foreground">Confirm Password</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="bg-input border-border text-foreground"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                      {error}
                    </p>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Get Your Chips'}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
