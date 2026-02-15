import { createClient } from '@/lib/supabase/client';
import { Proposal } from './daoUtils';

/**
 * Store a proposal in Supabase after it's created on the blockchain
 */
export async function storeProposalInSupabase(
  proposalId: number,
  lotSize: number,
  sharePrice: number,
  maxPerInvestor: number,
  proposalSummary: string,
  user: string,
  deadline: number,
  transactionHash: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('dao_proposals')
      .upsert({
        proposal_id: proposalId,
        lot_size: lotSize,
        share_price: sharePrice,
        max_per_investor: maxPerInvestor,
        proposal_summary: proposalSummary,
        creator_address: user.toLowerCase(),
        deadline: new Date(deadline * 1000).toISOString(),
        transaction_hash: transactionHash,
        yay_votes: 0,
        nay_votes: 0,
        executed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'proposal_id'
      });
    
    if (error) {
      console.error('Error storing proposal in Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error storing proposal:', error);
    return false;
  }
}

/**
 * Get a single proposal from Supabase by ID
 */
export async function getProposalFromSupabase(proposalId: number): Promise<Proposal | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('dao_proposals')
      .select('*')
      .eq('proposal_id', proposalId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching proposal from Supabase:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const deadline = Math.floor(new Date(data.deadline).getTime() / 1000);
    let status: "voting" | "closed" | "marketplace" = "voting";
    
    if (deadline <= now) {
      // If executed, it should be "marketplace" (available for investment)
      // If not executed but deadline passed, it's "closed" (voting ended but not executed)
      status = data.executed ? "marketplace" : "closed";
    } else {
      // If deadline hasn't passed, check if executed anyway (for demo purposes)
      if (data.executed) {
        status = "marketplace";
      }
    }
    
    return {
      id: data.proposal_id.toString(),
      proposalId: data.proposal_id,
      lotSize: data.lot_size,
      sharePrice: data.share_price,
      maxPerInvestor: data.max_per_investor,
      proposalSummary: data.proposal_summary,
      deadline: deadline,
      user: data.creator_address,
      yayVotes: data.yay_votes || 0,
      nayVotes: data.nay_votes || 0,
      executed: data.executed || false,
      status: status,
      createdAt: new Date(data.created_at),
      votingEndsAt: new Date(data.deadline),
    };
  } catch (error) {
    console.error('Error getting proposal from Supabase:', error);
    return null;
  }
}

/**
 * Get all proposals from Supabase
 */
export async function getProposalsFromSupabase(): Promise<Proposal[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('dao_proposals')
      .select('*')
      .order('proposal_id', { ascending: false });
    
    if (error) {
      console.error('Error fetching proposals from Supabase:', error);
      return [];
    }
    
    if (!data) {
      return [];
    }
    
    const now = Math.floor(Date.now() / 1000);
    
    // Transform Supabase data to Proposal format
    return data.map((row: any) => {
      const deadline = Math.floor(new Date(row.deadline).getTime() / 1000);
      let status: "voting" | "closed" | "marketplace" = "voting";
      
      if (deadline <= now) {
        // If executed, it should be "marketplace" (available for investment)
        // If not executed but deadline passed, it's "closed" (voting ended but not executed)
        status = row.executed ? "marketplace" : "closed";
      } else {
        // If deadline hasn't passed, check if executed anyway (for demo purposes)
        if (row.executed) {
          status = "marketplace";
        }
      }
      
      return {
        id: row.proposal_id.toString(),
        proposalId: row.proposal_id,
        lotSize: row.lot_size,
        sharePrice: row.share_price,
        maxPerInvestor: row.max_per_investor,
        proposalSummary: row.proposal_summary,
        deadline: deadline,
        user: row.creator_address,
        yayVotes: row.yay_votes || 0,
        nayVotes: row.nay_votes || 0,
        executed: row.executed || false,
        status: status,
        createdAt: new Date(row.created_at),
        votingEndsAt: new Date(row.deadline),
      };
    });
  } catch (error) {
    console.error('Error getting proposals from Supabase:', error);
    return [];
  }
}

/**
 * Update proposal votes in Supabase
 */
export async function updateProposalVotes(
  proposalId: number,
  yayVotes: number,
  nayVotes: number
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('dao_proposals')
      .update({
        yay_votes: yayVotes,
        nay_votes: nayVotes,
        updated_at: new Date().toISOString(),
      })
      .eq('proposal_id', proposalId);
    
    if (error) {
      console.error('Error updating proposal votes:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating proposal votes:', error);
    return false;
  }
}

/**
 * Update proposal execution status
 */
export async function updateProposalExecution(
  proposalId: number,
  executed: boolean
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('dao_proposals')
      .update({
        executed: executed,
        updated_at: new Date().toISOString(),
      })
      .eq('proposal_id', proposalId);
    
    if (error) {
      console.error('Error updating proposal execution:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating proposal execution:', error);
    return false;
  }
}

