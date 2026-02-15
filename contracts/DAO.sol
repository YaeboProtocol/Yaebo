// SPDX-License-Identifier: MIT
pragma solidity ^0.8.33;
import "@openzeppelin/contracts/access/Ownable.sol";

contract Dao is Ownable {
    
    constructor() Ownable(msg.sender) {}

    struct user {
        bool isMember;
    }
    
    mapping (address => user) public addressToUser;

    enum Vote {
        yay,
        nay
    }

    struct Proposal {
        uint256 yayVotes;
        uint256 nayVotes;
        uint256 deadline;
        address user;
        uint256 lotSize;
        uint256 SharePrice;
        uint256 maxPerInvestor;
        string proposalSummary;
        bool executed;
        mapping(address => bool) voted;
    }

    uint public numProposal;

    mapping (uint => Proposal) idToProposal;

    uint membership = 0.1 ether;
    uint duration = 7 days;

    event joinedDao(address user);
    event proposalCreated(uint proposalId, address user);
    event proposalVoted(uint proposalId, address user);

    function join() public payable {
        require(msg.value == membership);
        addressToUser[msg.sender] = user(true);
    }

    modifier onlyMember() {
        require(addressToUser[msg.sender].isMember == true, "not a member of pool");
        _;
    }

    function createProposal(uint lotSize, uint SharePrice, uint maxPerInvestor, string memory proposalSummary) public onlyMember returns(uint256) {
        numProposal ++;
        Proposal storage proposal = idToProposal[numProposal];
        proposal.deadline = block.timestamp + duration;
        proposal.user = msg.sender;
        proposal.lotSize = lotSize;
        proposal.SharePrice = SharePrice;
        proposal.maxPerInvestor = maxPerInvestor;
        proposal.proposalSummary = proposalSummary;
        emit  proposalCreated(numProposal, msg.sender);
        return numProposal;
    }

    function voteProposal(uint proposalId, Vote vote) public onlyMember {
        Proposal storage proposal = idToProposal[proposalId];
        require(idToProposal[proposalId].deadline > block.timestamp, "deadline exceeded");
        require(!proposal.voted[msg.sender], "already voted");
        if (vote == Vote.yay) {
            proposal.yayVotes++;
        }
        if (vote == Vote.nay) {
            proposal.nayVotes++;
        }
        proposal.voted[msg.sender] = true;
        emit proposalVoted(numProposal, msg.sender);
    }

    function executeProposal(uint256 proposalId) public onlyMember {
        // require(idToProposal[proposalId].deadline <= block.timestamp, "deadline exceeded");
        require(!idToProposal[proposalId].executed, "proposal already executed");
        idToProposal[numProposal].executed = true;
    }

    function buyLot() public {}

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }


    receive() external payable {}

    fallback() external payable {}
}