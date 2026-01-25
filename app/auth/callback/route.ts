import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error, data: { user } } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        console.error('Error exchanging code for session:', error.message)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
    }

    if (user) {
        // Check if user already has a role assigned in metadata
        if (!user.user_metadata?.role) {
            // No role found, redirect to role selection page
            console.log(`User ${user.id} has no role, redirecting to role selection.`);
            // Preserve the original 'next' redirect path
            const selectRoleUrl = new URL(`${origin}/auth/select-role`);
            selectRoleUrl.searchParams.set('next', next);
            return NextResponse.redirect(selectRoleUrl.toString());
        }

        // User has a role, proceed with normal login redirect
        console.log(`User ${user.id} logged in with role: ${user.user_metadata.role}`);
        const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
        const isLocalEnv = process.env.NODE_ENV === 'development'
        if (isLocalEnv) {
            // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
            return NextResponse.redirect(`${origin}${next}`)
        } else if (forwardedHost) {
            return NextResponse.redirect(`https://${forwardedHost}${next}`)
        } else {
            return NextResponse.redirect(`${origin}${next}`)
        }
    } else {
        console.error('No user data received after exchanging code.')
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_user_data`)
    }
  }

  // Fallback redirect if no code is present
  console.warn('No code found in callback request.');
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
}