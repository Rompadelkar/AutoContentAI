import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Spade, Mail, CheckCircle } from 'lucide-react'

export default function SignUpSuccessPage() {
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                <CheckCircle className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-2xl text-foreground">Check Your Email</CardTitle>
              <CardDescription className="text-muted-foreground">
                We&apos;ve sent you a confirmation link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
                <Mail className="h-5 w-5 text-primary" />
                <p className="text-sm text-foreground">
                  Click the link in your email to activate your account and claim your 10,000 free chips!
                </p>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Didn&apos;t receive the email?</p>
                <p>Check your spam folder or try signing up again.</p>
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/login">Back to Login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
