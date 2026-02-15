import { createClient } from '@/lib/supabase/client';

/**
 * Get DAO membership status from Supabase
 * @param walletAddress - Wallet address to check
 * @returns Promise<boolean> - True if member, false otherwise
 */
export async function getDaoMembership(walletAddress: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const normalizedAddress = walletAddress.toLowerCase();
    
    const { data, error } = await supabase
      .from('dao_members')
      .select('is_member')
      .eq('wallet_address', normalizedAddress)
      .single();
    
    if (error) {
      // If record doesn't exist, user is not a member
      if (error.code === 'PGRST116') {
        return false;
      }
      console.error('Error fetching DAO membership:', error);
      return false;
    }
    
    return data?.is_member === true;
  } catch (error) {
    console.error('Error checking DAO membership:', error);
    return false;
  }
}

/**
 * Set DAO membership status in Supabase
 * @param walletAddress - Wallet address
 * @param isMember - Membership status
 * @returns Promise<boolean> - True if successful
 */
export async function setDaoMembership(walletAddress: string, isMember: boolean): Promise<boolean> {
  try {
    const supabase = createClient();
    const normalizedAddress = walletAddress.toLowerCase();
    
    // Use upsert to insert or update
    const { error } = await supabase
      .from('dao_members')
      .upsert({
        wallet_address: normalizedAddress,
        is_member: isMember,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'wallet_address'
      });
    
    if (error) {
      console.error('Error setting DAO membership:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error setting DAO membership:', error);
    return false;
  }
}

/**
 * Remove DAO membership record (optional cleanup)
 * @param walletAddress - Wallet address
 * @returns Promise<boolean> - True if successful
 */
export async function removeDaoMembership(walletAddress: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const normalizedAddress = walletAddress.toLowerCase();
    
    const { error } = await supabase
      .from('dao_members')
      .delete()
      .eq('wallet_address', normalizedAddress);
    
    if (error) {
      console.error('Error removing DAO membership:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error removing DAO membership:', error);
    return false;
  }
}

