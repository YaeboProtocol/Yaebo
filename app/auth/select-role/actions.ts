'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type Role = 'investor' | 'manufacturer'

export async function selectUserRole(role: Role, next: string = '/') {
  const supabase = await createClient()

  const { data: { user }, error: getUserError } = await supabase.auth.getUser()

  if (getUserError || !user) {
    console.error('Error getting user or no user found:', getUserError?.message)
    // Redirect to an error page or login page if user cannot be confirmed
    redirect('/auth/auth-code-error?error=user_not_found')
  }

  // Optional: Check if the user already has a role to prevent accidental overwrites
  if (user.user_metadata?.role) {
      console.warn(`User ${user.id} already has role ${user.user_metadata.role}. Overwriting with ${role}.`)
      // Depending on requirements, you might want to prevent this or allow it.
      // For now, we allow overwriting.
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: { role: role }
  })

  if (updateError) {
    console.error('Error updating user role:', updateError.message)
    // Redirect to an error page with the specific error
    redirect(`/auth/auth-code-error?error=${encodeURIComponent('role_update_failed: ' + updateError.message)}`)
  }

  console.log(`Successfully set role ${role} for user ${user.id}`)

  // Revalidate the root path or specific paths if needed, though redirect might be enough
  revalidatePath('/', 'layout')

  // Redirect the user to their original destination or a default dashboard
  redirect(next)
} 