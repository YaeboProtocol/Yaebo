"use client";

import { createClient } from '@/lib/supabase/client';
import { getProposalFromSupabase } from './daoProposals';

export interface Investment {
  id: string;
  investorAddress: string;
  proposalId: number;
  lots: number;
  lotPrice: number;
  totalAmount: number;
  transactionHash: string;
  purchaseDate: Date;
  status: "active" | "completed" | "cancelled";
  proposal?: {
    id: string;
    proposalId: number;
    proposalSummary: string;
    lotSize: number;
    sharePrice: number;
    maxPerInvestor: number;
    deadline: number;
    status: "voting" | "closed" | "marketplace";
  };
}

/**
 * Store an investment in Supabase after successful purchase
 */
export async function storeInvestment(
  investorAddress: string,
  proposalId: number,
  lots: number,
  lotPrice: number,
  totalAmount: number,
  transactionHash: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('investments')
      .insert({
        investor_address: investorAddress.toLowerCase(),
        proposal_id: proposalId,
        lots: lots,
        lot_price: lotPrice,
        total_amount: totalAmount,
        transaction_hash: transactionHash,
        status: 'active',
        purchase_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    
    if (error) {
      console.error('Error storing investment in Supabase:', error);
      
      // Check if it's an RLS policy error
      if (error.message?.includes('row-level security policy') || error.code === '42501') {
        console.error('RLS Policy Error: The investments table requires Row Level Security policies to be set up.');
        console.error('Please run this SQL in your Supabase SQL editor:');
        console.error(`
-- Allow anyone to insert their own investments
CREATE POLICY "Allow insert own investments" ON investments
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read their own investments
CREATE POLICY "Allow read own investments" ON investments
  FOR SELECT
  USING (true);
        `);
      }
      
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('Error storing investment:', error);
    
    // Check if it's an RLS policy error
    if (error?.message?.includes('row-level security policy') || error?.code === '42501') {
      console.error('RLS Policy Error: The investments table requires Row Level Security policies to be set up.');
    }
    
    return false;
  }
}

/**
 * Get all investments for a specific investor address
 */
export async function getInvestmentsByAddress(investorAddress: string): Promise<Investment[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('investor_address', investorAddress.toLowerCase())
      .order('purchase_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching investments:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Fetch proposal details for each investment
    const investmentsWithProposals = await Promise.all(
      data.map(async (row: any) => {
        const proposal = await getProposalFromSupabase(row.proposal_id);
        
        return {
          id: row.id,
          investorAddress: row.investor_address,
          proposalId: row.proposal_id,
          lots: row.lots,
          lotPrice: row.lot_price,
          totalAmount: row.total_amount,
          transactionHash: row.transaction_hash,
          purchaseDate: new Date(row.purchase_date),
          status: row.status as "active" | "completed" | "cancelled",
          proposal: proposal ? {
            id: proposal.id,
            proposalId: proposal.proposalId,
            proposalSummary: proposal.proposalSummary,
            lotSize: proposal.lotSize,
            sharePrice: proposal.sharePrice,
            maxPerInvestor: proposal.maxPerInvestor,
            deadline: proposal.deadline,
            status: proposal.status,
          } : undefined,
        };
      })
    );
    
    return investmentsWithProposals;
  } catch (error) {
    console.error('Error fetching investments:', error);
    return [];
  }
}

/**
 * Get a single investment by ID
 */
export async function getInvestmentById(investmentId: string): Promise<Investment | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('investments')
      .select('*')
      .eq('id', investmentId)
      .single();
    
    if (error) {
      console.error('Error fetching investment:', error);
      return null;
    }
    
    if (!data) {
      return null;
    }
    
    const proposal = await getProposalFromSupabase(data.proposal_id);
    
    return {
      id: data.id,
      investorAddress: data.investor_address,
      proposalId: data.proposal_id,
      lots: data.lots,
      lotPrice: data.lot_price,
      totalAmount: data.total_amount,
      transactionHash: data.transaction_hash,
      purchaseDate: new Date(data.purchase_date),
      status: data.status as "active" | "completed" | "cancelled",
      proposal: proposal ? {
        id: proposal.id,
        proposalId: proposal.proposalId,
        proposalSummary: proposal.proposalSummary,
        lotSize: proposal.lotSize,
        sharePrice: proposal.sharePrice,
        maxPerInvestor: proposal.maxPerInvestor,
        deadline: proposal.deadline,
        status: proposal.status,
      } : undefined,
    };
  } catch (error) {
    console.error('Error fetching investment:', error);
    return null;
  }
}

