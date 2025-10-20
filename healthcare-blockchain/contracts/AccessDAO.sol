// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AccessDAO
 * @dev Decentralized Autonomous Organization for managing access control and governance
 * @author CoalitionCom 2.0 Team
 */
contract AccessDAO {
    
    struct Proposal {
        uint256 proposalId;
        address proposer;
        string title;
        string description;
        uint256 proposalType; // 1: Add Member, 2: Remove Member, 3: Change Access Rules, 4: Emergency Action
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        bool passed;
        mapping(address => bool) hasVoted;
        mapping(address => uint256) voteWeight;
    }
    
    struct Member {
        address memberAddress;
        string nationCode;
        string role;
        uint256 votingPower;
        bool isActive;
        uint256 joinTime;
        bool isEmergencyMember; // Can vote on emergency proposals
    }
    
    struct AccessRule {
        string dataType;
        string classification;
        uint256 requiredApprovals;
        uint256 timeLimit; // Hours before auto-approval
        bool isActive;
    }
    
    address public admin;
    uint256 public proposalCount = 0;
    uint256 public memberCount = 0;
    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant EMERGENCY_VOTING_PERIOD = 1 hours;
    uint256 public constant QUORUM_THRESHOLD = 30; // 30% of total voting power
    uint256 public constant MAJORITY_THRESHOLD = 51; // 51% of votes
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => Member) public members;
    mapping(string => AccessRule) public accessRules;
    mapping(address => bool) public authorizedVoters;
    
    // Emergency procedures
    bool public emergencyMode = false;
    address[] public emergencyMembers;
    
    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string title);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, bool passed);
    event MemberAdded(address indexed member, string nationCode);
    event MemberRemoved(address indexed member);
    event EmergencyModeActivated();
    event EmergencyModeDeactivated();
    event AccessRuleUpdated(string dataType, string classification, uint256 requiredApprovals);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyMember() {
        require(members[msg.sender].isActive, "Only active members can perform this action");
        _;
    }
    
    modifier onlyEmergencyMember() {
        require(members[msg.sender].isActive && members[msg.sender].isEmergencyMember, "Only emergency members can perform this action");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        // Add admin as first member
        members[admin] = Member({
            memberAddress: admin,
            nationCode: "ADMIN",
            role: "Administrator",
            votingPower: 100,
            isActive: true,
            joinTime: block.timestamp,
            isEmergencyMember: true
        });
        memberCount = 1;
    }
    
    /**
     * @dev Create a new proposal
     */
    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _proposalType
    ) public onlyMember returns (uint256) {
        require(_proposalType >= 1 && _proposalType <= 4, "Invalid proposal type");
        
        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        
        proposal.proposalId = proposalCount;
        proposal.proposer = msg.sender;
        proposal.title = _title;
        proposal.description = _description;
        proposal.proposalType = _proposalType;
        proposal.votesFor = 0;
        proposal.votesAgainst = 0;
        proposal.startTime = block.timestamp;
        proposal.endTime = block.timestamp + (_proposalType == 4 ? EMERGENCY_VOTING_PERIOD : VOTING_PERIOD);
        proposal.executed = false;
        proposal.passed = false;
        
        emit ProposalCreated(proposalCount, msg.sender, _title);
        return proposalCount;
    }
    
    /**
     * @dev Vote on a proposal
     */
    function vote(uint256 _proposalId, bool _support) public onlyMember {
        require(_proposalId <= proposalCount, "Proposal does not exist");
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp <= proposal.endTime, "Voting period has ended");
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.hasVoted[msg.sender], "Already voted");
        
        uint256 weight = members[msg.sender].votingPower;
        proposal.hasVoted[msg.sender] = true;
        proposal.voteWeight[msg.sender] = weight;
        
        if (_support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }
        
        emit VoteCast(_proposalId, msg.sender, _support, weight);
    }
    
    /**
     * @dev Execute a proposal
     */
    function executeProposal(uint256 _proposalId) public onlyMember {
        require(_proposalId <= proposalCount, "Proposal does not exist");
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp > proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");
        
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        uint256 totalVotingPower = getTotalVotingPower();
        uint256 quorum = (totalVotes * 100) / totalVotingPower;
        
        require(quorum >= QUORUM_THRESHOLD, "Quorum not reached");
        
        bool passed = proposal.votesFor > proposal.votesAgainst;
        proposal.passed = passed;
        proposal.executed = true;
        
        if (passed) {
            _executeProposalAction(_proposalId);
        }
        
        emit ProposalExecuted(_proposalId, passed);
    }
    
    /**
     * @dev Execute the action based on proposal type
     */
    function _executeProposalAction(uint256 _proposalId) internal {
        Proposal storage proposal = proposals[_proposalId];
        
        if (proposal.proposalType == 1) {
            // Add member - would need additional parameters
            // This is a simplified version
        } else if (proposal.proposalType == 2) {
            // Remove member - would need member address
            // This is a simplified version
        } else if (proposal.proposalType == 3) {
            // Change access rules - would need new rule parameters
            // This is a simplified version
        } else if (proposal.proposalType == 4) {
            // Emergency action
            _handleEmergencyAction();
        }
    }
    
    /**
     * @dev Handle emergency actions
     */
    function _handleEmergencyAction() internal {
        // Emergency actions like suspending access, activating emergency mode, etc.
        emergencyMode = true;
        emit EmergencyModeActivated();
    }
    
    /**
     * @dev Add a new member (admin only for now, can be changed to proposal-based)
     */
    function addMember(
        address _memberAddress,
        string memory _nationCode,
        string memory _role,
        uint256 _votingPower,
        bool _isEmergencyMember
    ) public onlyAdmin {
        require(!members[_memberAddress].isActive, "Member already exists");
        
        members[_memberAddress] = Member({
            memberAddress: _memberAddress,
            nationCode: _nationCode,
            role: _role,
            votingPower: _votingPower,
            isActive: true,
            joinTime: block.timestamp,
            isEmergencyMember: _isEmergencyMember
        });
        
        if (_isEmergencyMember) {
            emergencyMembers.push(_memberAddress);
        }
        
        memberCount++;
        emit MemberAdded(_memberAddress, _nationCode);
    }
    
    /**
     * @dev Remove a member
     */
    function removeMember(address _memberAddress) public onlyAdmin {
        require(members[_memberAddress].isActive, "Member not found");
        
        members[_memberAddress].isActive = false;
        memberCount--;
        
        // Remove from emergency members if applicable
        for (uint i = 0; i < emergencyMembers.length; i++) {
            if (emergencyMembers[i] == _memberAddress) {
                emergencyMembers[i] = emergencyMembers[emergencyMembers.length - 1];
                emergencyMembers.pop();
                break;
            }
        }
        
        emit MemberRemoved(_memberAddress);
    }
    
    /**
     * @dev Update access rules
     */
    function updateAccessRule(
        string memory _dataType,
        string memory _classification,
        uint256 _requiredApprovals,
        uint256 _timeLimit
    ) public onlyAdmin {
        accessRules[_dataType] = AccessRule({
            dataType: _dataType,
            classification: _classification,
            requiredApprovals: _requiredApprovals,
            timeLimit: _timeLimit,
            isActive: true
        });
        
        emit AccessRuleUpdated(_dataType, _classification, _requiredApprovals);
    }
    
    /**
     * @dev Deactivate emergency mode
     */
    function deactivateEmergencyMode() public onlyEmergencyMember {
        require(emergencyMode, "Not in emergency mode");
        emergencyMode = false;
        emit EmergencyModeDeactivated();
    }
    
    /**
     * @dev Get total voting power
     */
    function getTotalVotingPower() public view returns (uint256) {
        uint256 total = 0;
        // This would iterate through all active members
        // For gas efficiency, this is simplified
        return memberCount * 100; // Assuming each member has 100 voting power
    }
    
    /**
     * @dev Get proposal details
     */
    function getProposal(uint256 _proposalId) public view returns (
        uint256 proposalId,
        address proposer,
        string memory title,
        string memory description,
        uint256 proposalType,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 startTime,
        uint256 endTime,
        bool executed,
        bool passed
    ) {
        require(_proposalId <= proposalCount, "Proposal does not exist");
        Proposal storage proposal = proposals[_proposalId];
        
        return (
            proposal.proposalId,
            proposal.proposer,
            proposal.title,
            proposal.description,
            proposal.proposalType,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.startTime,
            proposal.endTime,
            proposal.executed,
            proposal.passed
        );
    }
    
    /**
     * @dev Check if member has voted on proposal
     */
    function hasVoted(uint256 _proposalId, address _voter) public view returns (bool) {
        require(_proposalId <= proposalCount, "Proposal does not exist");
        return proposals[_proposalId].hasVoted[_voter];
    }
    
    /**
     * @dev Get member voting power
     */
    function getMemberVotingPower(address _memberAddress) public view returns (uint256) {
        require(members[_memberAddress].isActive, "Member not found");
        return members[_memberAddress].votingPower;
    }
}
