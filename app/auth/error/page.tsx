import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Spade, AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Spade className="h-10 w-10 text-primary fill-primary" />
              <h1 className="text-3xl font-bold text-foreground">All-In Poker</h1>
            </div>
          </div>

          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl text-foreground">Authentication Error</CardTitle>
              <CardDescription className="text-muted-foreground">
                Something went wrong during authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Please try logging in again. If the problem persists, contact support.
              </p>

              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Try Again</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">Go Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
