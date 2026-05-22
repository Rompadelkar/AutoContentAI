import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Spade, Users, Trophy, Gift, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/lobby')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <Spade className="h-8 w-8 text-primary fill-primary" />
          <span className="text-xl font-bold text-foreground">All-In Poker</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">Play Free</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight text-balance">
              Texas Hold&apos;em
              <span className="block text-primary">Multiplayer</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Play poker with friends in real-time. Create private rooms, climb the leaderboard, and prove you&apos;re the best at the table.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/auth/sign-up">Start Playing Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-12">
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Multiplayer"
              description="Play with 2-6 players in real-time"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Private Rooms"
              description="Create rooms with secret codes"
            />
            <FeatureCard
              icon={<Trophy className="h-6 w-6" />}
              title="Leaderboard"
              description="Compete for the top spot"
            />
            <FeatureCard
              icon={<Gift className="h-6 w-6" />}
              title="Daily Rewards"
              description="Claim free chips every day"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-muted-foreground text-sm">
        <p>Play responsibly. This is a free-to-play game with no real money gambling.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border border-border">
      <div className="p-3 rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground text-center">{description}</p>
    </div>
  )
}
