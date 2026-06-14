// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev DAO Governance Voting contract supporting proposals, voting power, and status updates.
 */
contract DAOAdmin {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 endTime;
        bool executed;
        mapping(address => bool) voted;
    }

    address public admin;
    uint256 public proposalCount;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public votingPower;

    event ProposalCreated(uint256 id, string title, string description, uint256 endTime);
    event Voted(uint256 proposalId, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 proposalId);

    constructor() {
        admin = msg.sender;
        // Seed initial voting power to deployer
        votingPower[msg.sender] = 1000 * 10**18;
    }

    function assignVotingPower(address user, uint256 amount) public {
        require(msg.sender == admin, "Only admin can assign voting power");
        votingPower[user] = amount;
    }

    function createProposal(string memory title, string memory description, uint256 votingPeriodSeconds) public returns (uint256) {
        require(votingPower[msg.sender] > 0, "Must have voting power to propose");
        
        uint256 proposalId = proposalCount;
        proposalCount++;

        Proposal storage newProposal = proposals[proposalId];
        newProposal.id = proposalId;
        newProposal.title = title;
        newProposal.description = description;
        newProposal.endTime = block.timestamp + votingPeriodSeconds;
        newProposal.executed = false;

        emit ProposalCreated(proposalId, title, description, newProposal.endTime);
        return proposalId;
    }

    function vote(uint256 proposalId, bool support) public {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.endTime, "Voting has ended");
        require(!proposal.voted[msg.sender], "Already voted");

        uint256 weight = votingPower[msg.sender];
        require(weight > 0, "No voting power");

        proposal.voted[msg.sender] = true;

        if (support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }

        emit Voted(proposalId, msg.sender, support, weight);
    }

    function executeProposal(uint256 proposalId) public {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.endTime, "Voting still active");
        require(!proposal.executed, "Already executed");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal failed");

        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }

    // Helper functions to fetch proposal fields that struct mapping prevents returning directly
    function getProposal(uint256 proposalId) public view returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 endTime,
        bool executed
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.endTime,
            proposal.executed
        );
    }
}
