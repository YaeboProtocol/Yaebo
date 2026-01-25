"use client";

import { useState } from "react";
import { useSorobanReact } from "@soroban-react/core";

// Contract ID from the examples provided
const STD_CONTRACT_ID = "CAUA5OCRFU7FGPTBBCO6QK2WZ7HHWSDFTUPQ5HOXZXRBEV2VDDOPJJOC";

// Type for SME details
interface SMEDetails {
  name: string;
  reg_num: string;
  jurisdiction: string;
  address: string;
  website: string;
}

const STDContractExample = () => {
  const { address, server } = useSorobanReact();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // For creating a proposal
  const [anchorAddress, setAnchorAddress] = useState("");
  const [smeDetails, setSmeDetails] = useState<SMEDetails>({
    name: "SME Example Ltd.",
    reg_num: "REG-987",
    jurisdiction: "Exampleland",
    address: "456 Oak Ave",
    website: "http://sme.example",
  });
  const [researchUrl, setResearchUrl] = useState("http://papers.co/research123");
  const [initialInvestReq, setInitialInvestReq] = useState(10000000000);
  const [initialLotPrice, setInitialLotPrice] = useState(50000000);
  const [totalLots, setTotalLots] = useState(200);
  const [maxSlotsPerInvestor, setMaxSlotsPerInvestor] = useState(20);
  const [investPeriod, setInvestPeriod] = useState(172800);
  const [profitSharePct, setProfitSharePct] = useState(10);
  const [expectedReturnPct, setExpectedReturnPct] = useState(15);

  // For finalizing discussion
  const [proposalId, setProposalId] = useState(0);
  const [daoMember, setDaoMember] = useState("");
  const [finalLotPrice, setFinalLotPrice] = useState(55000000);
  const [finalProfitSharePct, setFinalProfitSharePct] = useState(12);

  // For investing
  const [investor, setInvestor] = useState("");
  const [numLots, setNumLots] = useState(5);

  // Reset state
  const resetState = () => {
    setLoading(false);
    setError(null);
    setResult(null);
  };

  // Execute contract operation with error handling
  const executeOperation = async (operation: () => Promise<any>) => {
    resetState();
    setLoading(true);

    try {
      if (!server) {
        throw new Error("Server is not set up. Unable to connect to the blockchain.");
      }

      const result = await operation();
      setResult(result);
      return result;
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Error executing operation");
    } finally {
      setLoading(false);
    }
  };

  // Create a new proposal
  const handleCreateProposal = async () => {
    await executeOperation(async () => {
      const smeDetailsString = JSON.stringify(smeDetails);
      
      // This would use the server.call method in a real implementation
      console.log("Creating proposal with:", {
        contract: STD_CONTRACT_ID,
        method: "create_proposal",
        params: {
          anchor_addr: anchorAddress,
          sme_details: smeDetailsString,
          research_paper_url: researchUrl,
          init_invest_req: initialInvestReq,
          initial_lot_price: initialLotPrice,
          initial_total_lots: totalLots,
          initial_max_slots_per_investor: maxSlotsPerInvestor,
          init_invest_period: investPeriod,
          init_profit_share_pct: profitSharePct,
          init_exp_return_pct: expectedReturnPct
        }
      });
      
      // Example of how the call would be made
      /* 
      return await server.call(
        STD_CONTRACT_ID,
        "create_proposal",
        {
          anchor_addr: anchorAddress,
          sme_details: smeDetailsString,
          research_paper_url: researchUrl,
          init_invest_req: initialInvestReq,
          initial_lot_price: initialLotPrice,
          initial_total_lots: totalLots,
          initial_max_slots_per_investor: maxSlotsPerInvestor,
          init_invest_period: investPeriod,
          init_profit_share_pct: profitSharePct,
          init_exp_return_pct: expectedReturnPct
        }
      );
      */

      // For demo purposes, return a mock result
      return { status: "success", txHash: "mock_tx_hash_for_create_proposal" };
    });
  };

  // Finalize a discussion
  const handleFinalizeDiscussion = async () => {
    await executeOperation(async () => {
      // This would use the server.call method in a real implementation
      console.log("Finalizing discussion with:", {
        contract: STD_CONTRACT_ID,
        method: "finalize_discussion",
        params: {
          dao_member: daoMember,
          proposal_id: proposalId,
          final_lot_price: finalLotPrice,
          final_total_lots: totalLots,
          final_max_slots_per_investor: maxSlotsPerInvestor,
          final_invest_period: investPeriod,
          final_profit_share_pct: finalProfitSharePct,
          final_expected_return_percent: expectedReturnPct
        }
      });

      // For demo purposes, return a mock result
      return { status: "success", txHash: "mock_tx_hash_for_finalize_discussion" };
    });
  };

  // Reject a proposal
  const handleRejectProposal = async () => {
    await executeOperation(async () => {
      // This would use the server.call method in a real implementation
      console.log("Rejecting proposal with:", {
        contract: STD_CONTRACT_ID,
        method: "dao_reject_proposal",
        params: {
          dao_member: daoMember,
          proposal_id: proposalId
        }
      });

      // For demo purposes, return a mock result
      return { status: "success", txHash: "mock_tx_hash_for_reject_proposal" };
    });
  };

  // Invest in a proposal
  const handleInvest = async () => {
    await executeOperation(async () => {
      // This would use the server.call method in a real implementation
      console.log("Investing with:", {
        contract: STD_CONTRACT_ID,
        method: "invest",
        params: {
          investor: investor,
          proposal_id: proposalId,
          num_lots: numLots
        }
      });

      // For demo purposes, return a mock result
      return { status: "success", txHash: "mock_tx_hash_for_invest" };
    });
  };

  // Get proposal details
  const handleGetProposal = async () => {
    await executeOperation(async () => {
      // This would use the server.call method in a real implementation
      console.log("Getting proposal with:", {
        contract: STD_CONTRACT_ID,
        method: "get_proposal",
        params: {
          proposal_id: proposalId
        }
      });

      // For demo purposes, return a mock result with proposal details
      return {
        id: proposalId,
        anchor_address: "GA5E5ZWM5QLOCVGMV3MQLQMTE6TP2SKAUMI6Z5QCSJUGFZACSQ7HADF7",
        sme_details: JSON.stringify(smeDetails),
        research_paper_url: "http://papers.co/research123",
        status: "ACTIVE",
        invest_req: initialInvestReq,
        lot_price: initialLotPrice,
        total_lots: totalLots,
        max_slots_per_investor: maxSlotsPerInvestor,
        invest_period: investPeriod,
        profit_share_pct: profitSharePct,
        expected_return_pct: expectedReturnPct
      };
    });
  };

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">STD Protocol Contract Demo</h1>
      
      {address ? (
        <div className="mb-4 p-2 bg-green-100 rounded">
          Connected address: {address}
        </div>
      ) : (
        <div className="mb-4 p-2 bg-yellow-100 rounded">
          Please connect your wallet to interact with the contract.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Proposal Form */}
        <div className="border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Create Proposal</h2>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Anchor Address</label>
            <input
              type="text"
              value={anchorAddress}
              onChange={(e) => setAnchorAddress(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="GXXXX..."
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Research Paper URL</label>
            <input
              type="text"
              value={researchUrl}
              onChange={(e) => setResearchUrl(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Initial Lot Price</label>
              <input
                type="number"
                value={initialLotPrice}
                onChange={(e) => setInitialLotPrice(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Total Lots</label>
              <input
                type="number"
                value={totalLots}
                onChange={(e) => setTotalLots(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Max Slots Per Investor</label>
              <input
                type="number"
                value={maxSlotsPerInvestor}
                onChange={(e) => setMaxSlotsPerInvestor(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Profit Share %</label>
              <input
                type="number"
                value={profitSharePct}
                onChange={(e) => setProfitSharePct(Number(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <button
            onClick={handleCreateProposal}
            disabled={loading || !address}
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Processing..." : "Create Proposal"}
          </button>
        </div>

        {/* Proposal Management */}
        <div className="border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Proposal Management</h2>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Proposal ID</label>
            <input
              type="number"
              value={proposalId}
              onChange={(e) => setProposalId(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">DAO Member Address</label>
            <input
              type="text"
              value={daoMember}
              onChange={(e) => setDaoMember(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="GXXXX..."
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Final Lot Price</label>
            <input
              type="number"
              value={finalLotPrice}
              onChange={(e) => setFinalLotPrice(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={handleFinalizeDiscussion}
              disabled={loading || !address}
              className="p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              Finalize Discussion
            </button>
            
            <button
              onClick={handleRejectProposal}
              disabled={loading || !address}
              className="p-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              Reject Proposal
            </button>
          </div>

          <button
            onClick={handleGetProposal}
            disabled={loading}
            className="w-full p-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400"
          >
            Get Proposal Details
          </button>
        </div>

        {/* Invest Section */}
        <div className="border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Invest in Proposal</h2>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Investor Address</label>
            <input
              type="text"
              value={investor}
              onChange={(e) => setInvestor(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="GXXXX..."
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Proposal ID</label>
            <input
              type="number"
              value={proposalId}
              onChange={(e) => setProposalId(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Number of Lots</label>
            <input
              type="number"
              value={numLots}
              onChange={(e) => setNumLots(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>

          <button
            onClick={handleInvest}
            disabled={loading || !address}
            className="w-full p-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
          >
            Invest
          </button>
        </div>

        {/* Results Display */}
        <div className="border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Operation Results</h2>
          
          {loading && (
            <div className="text-center p-4">
              <p>Processing transaction...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          {result && (
            <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded">
              <p className="font-bold">Success</p>
              <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default STDContractExample; 