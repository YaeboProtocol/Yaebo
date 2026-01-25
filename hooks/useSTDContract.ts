// import { useState, useCallback } from 'react';
// import { useSorobanReact } from '@soroban-react/core';

// // Contract ID from example
// const STD_CONTRACT_ID = "CAUA5OCRFU7FGPTBBCO6QK2WZ7HHWSDFTUPQ5HOXZXRBEV2VDDOPJJOC";

// interface SMEDetails {
//   name: string;
//   reg_num: string;
//   jurisdiction: string;
//   address: string;
//   website: string;
// }

// interface UseSTDContractReturn {
//   loading: boolean;
//   error: string | null;
//   reset: () => void;
//   finalizeDiscussion: (
//     daoMember: string,
//     proposalId: number,
//     finalLotPrice: number,
//     finalTotalLots: number,
//     finalMaxSlotsPerInvestor: number,
//     finalInvestPeriod: number,
//     finalProfitSharePct: number,
//     finalExpectedReturnPercent: number
//   ) => Promise<any>;
//   createProposal: (
//     anchorAddr: string,
//     smeDetails: SMEDetails,
//     researchPaperUrl: string,
//     initInvestReq: number,
//     initialLotPrice: number,
//     initialTotalLots: number,
//     initialMaxSlotsPerInvestor: number,
//     initInvestPeriod: number,
//     initProfitSharePct: number,
//     initExpReturnPct: number
//   ) => Promise<any>;
//   daoRejectProposal: (
//     daoMember: string,
//     proposalId: number
//   ) => Promise<any>;
//   invest: (
//     investor: string,
//     proposalId: number,
//     numLots: number
//   ) => Promise<any>;
//   getProposal: (
//     proposalId: number
//   ) => Promise<any>;
//   contractAddress: string;
// }

// export const useSTDContract = (): UseSTDContractReturn => {
//   const { address, server } = useSorobanReact();
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
  
//   const contractAddress = STD_CONTRACT_ID;

//   const reset = useCallback(() => {
//     setLoading(false);
//     setError(null);
//   }, []);

//   const handleOperation = async <T,>(
//     operation: () => Promise<T>
//   ): Promise<T | undefined> => {
//     setLoading(true);
//     setError(null);

//     if (!server) {
//       setError("Server is not setup. Unable to connect to the blockchain");
//       setLoading(false);
//       return undefined;
//     }

//     try {
//       const result = await operation();
//       return result;
//     } catch (e: any) {
//       console.error(e);
//       setError(e.message || "Error executing operation");
//       return undefined;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const finalizeDiscussion = useCallback(
//     async (
//       daoMember: string,
//       proposalId: number,
//       finalLotPrice: number,
//       finalTotalLots: number,
//       finalMaxSlotsPerInvestor: number,
//       finalInvestPeriod: number,
//       finalProfitSharePct: number,
//       finalExpectedReturnPercent: number
//     ) => {
//       return handleOperation(async () => {
//         if (!server) return;
        
//         // Using server.invoke directly with contract ID
//         return await server.invoke(
//           contractAddress,
//           "finalize_discussion",
//           {
//             dao_member: daoMember,
//             proposal_id: proposalId,
//             final_lot_price: finalLotPrice,
//             final_total_lots: finalTotalLots,
//             final_max_slots_per_investor: finalMaxSlotsPerInvestor,
//             final_invest_period: finalInvestPeriod,
//             final_profit_share_pct: finalProfitSharePct,
//             final_expected_return_percent: finalExpectedReturnPercent
//           },
//           { signAndSend: true }
//         );
//       });
//     },
//     [server, contractAddress, handleOperation]
//   );

//   const createProposal = useCallback(
//     async (
//       anchorAddr: string,
//       smeDetails: SMEDetails,
//       researchPaperUrl: string,
//       initInvestReq: number,
//       initialLotPrice: number,
//       initialTotalLots: number,
//       initialMaxSlotsPerInvestor: number,
//       initInvestPeriod: number,
//       initProfitSharePct: number,
//       initExpReturnPct: number
//     ) => {
//       return handleOperation(async () => {
//         if (!server) return;
        
//         const smeDetailsString = JSON.stringify(smeDetails);
//         return await server.invoke(
//           contractAddress,
//           "create_proposal",
//           {
//             anchor_addr: anchorAddr,
//             sme_details: smeDetailsString,
//             research_paper_url: researchPaperUrl,
//             init_invest_req: initInvestReq,
//             initial_lot_price: initialLotPrice,
//             initial_total_lots: initialTotalLots,
//             initial_max_slots_per_investor: initialMaxSlotsPerInvestor,
//             init_invest_period: initInvestPeriod,
//             init_profit_share_pct: initProfitSharePct,
//             init_exp_return_pct: initExpReturnPct
//           },
//           { signAndSend: true }
//         );
//       });
//     },
//     [server, contractAddress, handleOperation]
//   );

//   const daoRejectProposal = useCallback(
//     async (daoMember: string, proposalId: number) => {
//       return handleOperation(async () => {
//         if (!server) return;
        
//         return await server.invoke(
//           contractAddress,
//           "dao_reject_proposal",
//           {
//             dao_member: daoMember,
//             proposal_id: proposalId
//           },
//           { signAndSend: true }
//         );
//       });
//     },
//     [server, contractAddress, handleOperation]
//   );

//   const invest = useCallback(
//     async (investor: string, proposalId: number, numLots: number) => {
//       return handleOperation(async () => {
//         if (!server) return;
        
//         return await server.invoke(
//           contractAddress,
//           "invest",
//           {
//             investor,
//             proposal_id: proposalId,
//             num_lots: numLots
//           },
//           { signAndSend: true }
//         );
//       });
//     },
//     [server, contractAddress, handleOperation]
//   );

//   const getProposal = useCallback(
//     async (proposalId: number) => {
//       return handleOperation(async () => {
//         if (!server) return;
        
//         return await server.invoke(
//           contractAddress,
//           "get_proposal",
//           {
//             proposal_id: proposalId
//           },
//           { signAndSend: false }
//         );
//       });
//     },
//     [server, contractAddress, handleOperation]
//   );

//   return {
//     loading,
//     error,
//     reset,
//     finalizeDiscussion,
//     createProposal,
//     daoRejectProposal,
//     invest,
//     getProposal,
//     contractAddress
//   };
// }; 