'use client'

import { useSearchParams } from 'next/navigation'
import { selectUserRole } from './actions'
import { Suspense, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins, Factory, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SuspenseWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
     <SelectRolePage />
    </Suspense>
  )
}

 function SelectRolePage() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleRoleSelection = async (role: 'investor' | 'manufacturer') => {
    setError(null)
    
    // Show loading toast
    const loadingToast = toast.loading(`Setting up your ${role} account...`)
    
    startTransition(async () => {
      try {
        // The action handles redirection on success/error, so we don't need to await it here necessarily
        // unless we want to handle specific client-side feedback *before* redirect.
        await selectUserRole(role, next)
        
        // If we get here, it means there was no redirect yet
        toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} role selected successfully!`, {
          id: loadingToast,
        })
      } catch (e) {
        console.error('Client-side error during role selection transition:', e)
        const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.'
        setError(errorMessage)
        
        toast.error(`Failed to set role: ${errorMessage}`, {
          id: loadingToast,
        })
      }
    })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Select Your Role</CardTitle>
          <CardDescription>Choose how you want to participate on the STD Protocol platform</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-4">
          <Button
            onClick={() => handleRoleSelection('investor')}
            disabled={isPending}
            className="w-full h-16 justify-start px-4 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary font-medium border border-border"
            variant="ghost"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Coins className="mr-4 h-5 w-5" />
            )}
            <div className="flex flex-col items-start">
              <span className="text-base font-medium">Investor</span>
              <span className="text-xs text-muted-foreground">Browse opportunities and invest in projects</span>
            </div>
          </Button>

          <Button
            onClick={() => handleRoleSelection('manufacturer')}
            disabled={isPending}
            className="w-full h-16 justify-start px-4 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary font-medium border border-border"
            variant="ghost"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Factory className="mr-4 h-5 w-5" />
            )}
            <div className="flex flex-col items-start">
              <span className="text-base font-medium">Manufacturer</span>
              <span className="text-xs text-muted-foreground">Submit applications for your manufacturing business</span>
            </div>
          </Button>

          {error && (
            <div className="p-3 mt-4 text-sm text-red-700 bg-red-100 rounded-md">
              Error: {error}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center border-t px-6 py-4">
          <p className="text-xs text-center text-muted-foreground">
            By selecting a role, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 