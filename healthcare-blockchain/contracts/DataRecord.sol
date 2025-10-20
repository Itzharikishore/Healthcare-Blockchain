// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DataRecord
 * @dev Smart contract for managing defense intelligence data records with ZKP validation
 * @author CoalitionCom 2.0 Team
 */
contract DataRecord {
    
    struct IntelligenceRecord {
        uint256 recordId;
        address submitter;
        string ipfsHash;
        string dataType; // "satellite", "field_report", "analysis", "threat_assessment"
        string classification; // "confidential", "secret", "top_secret"
        string zkpProofHash;
        bool isVerified;
        uint256 timestamp;
        string metadata; // JSON string with additional data
    }
    
    struct AccessRequest {
        uint256 requestId;
        address requester;
        uint256 recordId;
        string purpose;
        bool isApproved;
        uint256 timestamp;
        address[] approvers;
    }
    
    struct CoalitionMember {
        address memberAddress;
        string nationCode; // "USA", "UK", "NATO", etc.
        string role; // "intelligence", "analyst", "commander"
        bool isActive;
        uint256 reputation;
        uint256 joinTimestamp;
    }
    
    address public admin;
    uint256 public recordCount = 0;
    uint256 public requestCount = 0;
    uint256 public memberCount = 0;
    
    // Mappings
    mapping(uint256 => IntelligenceRecord) public intelligenceRecords;
    mapping(uint256 => AccessRequest) public accessRequests;
    mapping(address => CoalitionMember) public coalitionMembers;
    mapping(address => bool) public authorizedNodes;
    mapping(uint256 => address[]) public recordAccessList;
    mapping(address => uint256[]) public memberRecords;
    
    // ZKP Verification
    mapping(string => bool) public verifiedProofs;
    
    // Events
    event RecordSubmitted(uint256 indexed recordId, address indexed submitter, string dataType);
    event RecordVerified(uint256 indexed recordId, string zkpProofHash);
    event AccessRequested(uint256 indexed requestId, address indexed requester, uint256 indexed recordId);
    event AccessGranted(uint256 indexed requestId, address indexed requester);
    event MemberAdded(address indexed member, string nationCode);
    event MemberRemoved(address indexed member);
    event NodeAuthorized(address indexed node);
    event NodeDeauthorized(address indexed node);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyMember() {
        require(coalitionMembers[msg.sender].isActive, "Only active coalition members");
        _;
    }
    
    modifier onlyAuthorizedNode() {
        require(authorizedNodes[msg.sender] || msg.sender == admin, "Only authorized nodes");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @dev Add a new coalition member
     */
    function addCoalitionMember(
        address _memberAddress,
        string memory _nationCode,
        string memory _role
    ) public onlyAdmin {
        require(!coalitionMembers[_memberAddress].isActive, "Member already exists");
        
        coalitionMembers[_memberAddress] = CoalitionMember({
            memberAddress: _memberAddress,
            nationCode: _nationCode,
            role: _role,
            isActive: true,
            reputation: 100, // Initial reputation score
            joinTimestamp: block.timestamp
        });
        
        memberCount++;
        emit MemberAdded(_memberAddress, _nationCode);
    }
    
    /**
     * @dev Remove a coalition member
     */
    function removeCoalitionMember(address _memberAddress) public onlyAdmin {
        require(coalitionMembers[_memberAddress].isActive, "Member not found");
        
        coalitionMembers[_memberAddress].isActive = false;
        memberCount--;
        emit MemberRemoved(_memberAddress);
    }
    
    /**
     * @dev Authorize a node for data submission
     */
    function authorizeNode(address _nodeAddress) public onlyAdmin {
        authorizedNodes[_nodeAddress] = true;
        emit NodeAuthorized(_nodeAddress);
    }
    
    /**
     * @dev Deauthorize a node
     */
    function deauthorizeNode(address _nodeAddress) public onlyAdmin {
        authorizedNodes[_nodeAddress] = false;
        emit NodeDeauthorized(_nodeAddress);
    }
    
    /**
     * @dev Submit intelligence data record
     */
    function submitIntelligenceRecord(
        string memory _ipfsHash,
        string memory _dataType,
        string memory _classification,
        string memory _metadata
    ) public onlyAuthorizedNode returns (uint256) {
        recordCount++;
        
        intelligenceRecords[recordCount] = IntelligenceRecord({
            recordId: recordCount,
            submitter: msg.sender,
            ipfsHash: _ipfsHash,
            dataType: _dataType,
            classification: _classification,
            zkpProofHash: "",
            isVerified: false,
            timestamp: block.timestamp,
            metadata: _metadata
        });
        
        emit RecordSubmitted(recordCount, msg.sender, _dataType);
        return recordCount;
    }
    
    /**
     * @dev Verify record with ZKP proof
     */
    function verifyRecordWithZKP(
        uint256 _recordId,
        string memory _zkpProofHash
    ) public onlyAuthorizedNode {
        require(_recordId <= recordCount, "Record does not exist");
        require(!intelligenceRecords[_recordId].isVerified, "Record already verified");
        
        intelligenceRecords[_recordId].zkpProofHash = _zkpProofHash;
        intelligenceRecords[_recordId].isVerified = true;
        verifiedProofs[_zkpProofHash] = true;
        
        emit RecordVerified(_recordId, _zkpProofHash);
    }
    
    /**
     * @dev Request access to a record
     */
    function requestAccess(
        uint256 _recordId,
        string memory _purpose
    ) public onlyMember returns (uint256) {
        require(_recordId <= recordCount, "Record does not exist");
        
        requestCount++;
        
        accessRequests[requestCount] = AccessRequest({
            requestId: requestCount,
            requester: msg.sender,
            recordId: _recordId,
            purpose: _purpose,
            isApproved: false,
            timestamp: block.timestamp,
            approvers: new address[](0)
        });
        
        emit AccessRequested(requestCount, msg.sender, _recordId);
        return requestCount;
    }
    
    /**
     * @dev Approve access request (requires multiple approvals for high classification)
     */
    function approveAccess(uint256 _requestId) public onlyMember {
        require(_requestId <= requestCount, "Request does not exist");
        AccessRequest storage request = accessRequests[_requestId];
        require(!request.isApproved, "Request already approved");
        
        // Check if this member has already approved
        bool alreadyApproved = false;
        for (uint i = 0; i < request.approvers.length; i++) {
            if (request.approvers[i] == msg.sender) {
                alreadyApproved = true;
                break;
            }
        }
        require(!alreadyApproved, "Already approved by this member");
        
        request.approvers.push(msg.sender);
        
        // Determine required approvals based on classification
        IntelligenceRecord memory record = intelligenceRecords[request.recordId];
        uint256 requiredApprovals = 1; // Default for confidential
        
        if (keccak256(bytes(record.classification)) == keccak256(bytes("secret"))) {
            requiredApprovals = 2;
        } else if (keccak256(bytes(record.classification)) == keccak256(bytes("top_secret"))) {
            requiredApprovals = 3;
        }
        
        if (request.approvers.length >= requiredApprovals) {
            request.isApproved = true;
            recordAccessList[request.recordId].push(request.requester);
            emit AccessGranted(_requestId, request.requester);
        }
    }
    
    /**
     * @dev Get record details
     */
    function getRecord(uint256 _recordId) public view returns (
        uint256 recordId,
        address submitter,
        string memory ipfsHash,
        string memory dataType,
        string memory classification,
        bool isVerified,
        uint256 timestamp
    ) {
        require(_recordId <= recordCount, "Record does not exist");
        IntelligenceRecord memory record = intelligenceRecords[_recordId];
        
        return (
            record.recordId,
            record.submitter,
            record.ipfsHash,
            record.dataType,
            record.classification,
            record.isVerified,
            record.timestamp
        );
    }
    
    /**
     * @dev Check if address has access to record
     */
    function hasAccess(uint256 _recordId, address _requester) public view returns (bool) {
        require(_recordId <= recordCount, "Record does not exist");
        
        // Check if requester is in access list
        address[] memory accessList = recordAccessList[_recordId];
        for (uint i = 0; i < accessList.length; i++) {
            if (accessList[i] == _requester) {
                return true;
            }
        }
        
        // Check if requester is the submitter
        if (intelligenceRecords[_recordId].submitter == _requester) {
            return true;
        }
        
        return false;
    }
    
    /**
     * @dev Get member information
     */
    function getMemberInfo(address _memberAddress) public view returns (
        string memory nationCode,
        string memory role,
        bool isActive,
        uint256 reputation
    ) {
        require(coalitionMembers[_memberAddress].isActive, "Member not found");
        CoalitionMember memory member = coalitionMembers[_memberAddress];
        
        return (
            member.nationCode,
            member.role,
            member.isActive,
            member.reputation
        );
    }
    
    /**
     * @dev Update member reputation
     */
    function updateReputation(address _memberAddress, uint256 _newReputation) public onlyAdmin {
        require(coalitionMembers[_memberAddress].isActive, "Member not found");
        coalitionMembers[_memberAddress].reputation = _newReputation;
    }
}
