// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GlobalAnchoring
 * @dev Smart contract for anchoring consortium state to public blockchain (Polygon)
 * @author CoalitionCom 2.0 Team
 */
contract GlobalAnchoring {
    
    struct AnchoringRecord {
        uint256 anchorId;
        string merkleRoot;
        uint256 blockNumber;
        uint256 timestamp;
        string stateHash;
        address[] participatingNodes;
        uint256 recordCount;
        string metadata;
    }
    
    struct NodeState {
        address nodeAddress;
        string nationCode;
        uint256 lastUpdateTime;
        string nodeHash;
        bool isActive;
        uint256 contributionCount;
    }
    
    address public admin;
    address public anchorOracle;
    uint256 public anchorCount = 0;
    uint256 public ANCHORING_INTERVAL = 24 hours; // Anchor every 24 hours
    uint256 public lastAnchorTime = 0;
    
    mapping(uint256 => AnchoringRecord) public anchoringRecords;
    mapping(address => NodeState) public nodeStates;
    mapping(string => bool) public anchoredMerkleRoots;
    mapping(uint256 => string) public blockToMerkleRoot;
    
    // Events
    event StateAnchored(uint256 indexed anchorId, string merkleRoot, uint256 blockNumber);
    event NodeStateUpdated(address indexed nodeAddress, string nodeHash);
    event AnchoringIntervalUpdated(uint256 newInterval);
    event OracleChanged(address indexed oldOracle, address indexed newOracle);
    event PublicBlockchainVerified(string merkleRoot, uint256 publicBlockNumber);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyOracle() {
        require(msg.sender == anchorOracle || msg.sender == admin, "Only authorized oracle");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        anchorOracle = msg.sender;
    }
    
    /**
     * @dev Set the anchoring oracle
     */
    function setAnchorOracle(address _newOracle) public onlyAdmin {
        address oldOracle = anchorOracle;
        anchorOracle = _newOracle;
        emit OracleChanged(oldOracle, _newOracle);
    }
    
    /**
     * @dev Update node state for anchoring
     */
    function updateNodeState(
        address _nodeAddress,
        string memory _nationCode,
        string memory _nodeHash
    ) public onlyOracle {
        nodeStates[_nodeAddress] = NodeState({
            nodeAddress: _nodeAddress,
            nationCode: _nationCode,
            lastUpdateTime: block.timestamp,
            nodeHash: _nodeHash,
            isActive: true,
            contributionCount: nodeStates[_nodeAddress].contributionCount + 1
        });
        
        emit NodeStateUpdated(_nodeAddress, _nodeHash);
    }
    
    /**
     * @dev Anchor consortium state to public blockchain
     */
    function anchorStateToPublicBlockchain(
        string memory _merkleRoot,
        uint256 _publicBlockNumber,
        address[] memory _participatingNodes,
        uint256 _recordCount,
        string memory _metadata
    ) public onlyOracle returns (uint256) {
        require(block.timestamp >= lastAnchorTime + ANCHORING_INTERVAL, "Anchoring interval not reached");
        require(!anchoredMerkleRoots[_merkleRoot], "Merkle root already anchored");
        
        anchorCount++;
        
        anchoringRecords[anchorCount] = AnchoringRecord({
            anchorId: anchorCount,
            merkleRoot: _merkleRoot,
            blockNumber: _publicBlockNumber,
            timestamp: block.timestamp,
            stateHash: _merkleRoot, // Simplified: using merkle root as state hash
            participatingNodes: _participatingNodes,
            recordCount: _recordCount,
            metadata: _metadata
        });
        
        anchoredMerkleRoots[_merkleRoot] = true;
        blockToMerkleRoot[_publicBlockNumber] = _merkleRoot;
        lastAnchorTime = block.timestamp;
        
        emit StateAnchored(anchorCount, _merkleRoot, _publicBlockNumber);
        emit PublicBlockchainVerified(_merkleRoot, _publicBlockNumber);
        
        return anchorCount;
    }
    
    /**
     * @dev Verify merkle root against public blockchain
     */
    function verifyMerkleRoot(string memory _merkleRoot, uint256 _publicBlockNumber) public view returns (bool) {
        return anchoredMerkleRoots[_merkleRoot] && 
               keccak256(bytes(blockToMerkleRoot[_publicBlockNumber])) == keccak256(bytes(_merkleRoot));
    }
    
    /**
     * @dev Get anchoring record
     */
    function getAnchoringRecord(uint256 _anchorId) public view returns (
        string memory merkleRoot,
        uint256 blockNumber,
        uint256 timestamp,
        uint256 recordCount,
        string memory metadata
    ) {
        require(_anchorId <= anchorCount, "Anchoring record does not exist");
        AnchoringRecord memory record = anchoringRecords[_anchorId];
        
        return (
            record.merkleRoot,
            record.blockNumber,
            record.timestamp,
            record.recordCount,
            record.metadata
        );
    }
    
    /**
     * @dev Get node state
     */
    function getNodeState(address _nodeAddress) public view returns (
        string memory nationCode,
        uint256 lastUpdateTime,
        string memory nodeHash,
        bool isActive,
        uint256 contributionCount
    ) {
        NodeState memory state = nodeStates[_nodeAddress];
        return (
            state.nationCode,
            state.lastUpdateTime,
            state.nodeHash,
            state.isActive,
            state.contributionCount
        );
    }
    
    /**
     * @dev Check if anchoring is due
     */
    function isAnchoringDue() public view returns (bool) {
        return block.timestamp >= lastAnchorTime + ANCHORING_INTERVAL;
    }
    
    /**
     * @dev Get time until next anchoring
     */
    function getTimeUntilNextAnchoring() public view returns (uint256) {
        if (block.timestamp >= lastAnchorTime + ANCHORING_INTERVAL) {
            return 0;
        }
        return (lastAnchorTime + ANCHORING_INTERVAL) - block.timestamp;
    }
    
    /**
     * @dev Update anchoring interval
     */
    function updateAnchoringInterval(uint256 _newInterval) public onlyAdmin {
        require(_newInterval >= 1 hours, "Interval too short");
        ANCHORING_INTERVAL = _newInterval;
        emit AnchoringIntervalUpdated(_newInterval);
    }
    
    /**
     * @dev Deactivate a node
     */
    function deactivateNode(address _nodeAddress) public onlyOracle {
        require(nodeStates[_nodeAddress].isActive, "Node not active");
        nodeStates[_nodeAddress].isActive = false;
    }
    
    /**
     * @dev Get latest anchoring record
     */
    function getLatestAnchoringRecord() public view returns (
        uint256 anchorId,
        string memory merkleRoot,
        uint256 blockNumber,
        uint256 timestamp
    ) {
        require(anchorCount > 0, "No anchoring records");
        AnchoringRecord memory record = anchoringRecords[anchorCount];
        
        return (
            record.anchorId,
            record.merkleRoot,
            record.blockNumber,
            record.timestamp
        );
    }
    
    /**
     * @dev Get participating nodes for a specific anchoring
     */
    function getParticipatingNodes(uint256 _anchorId) public view returns (address[] memory) {
        require(_anchorId <= anchorCount, "Anchoring record does not exist");
        return anchoringRecords[_anchorId].participatingNodes;
    }
    
    /**
     * @dev Calculate consortium state hash
     */
    function calculateStateHash(address[] memory _activeNodes) public view returns (string memory) {
        // Simplified state hash calculation
        // In a real implementation, this would involve Merkle tree construction
        bytes32 stateHash = keccak256(abi.encodePacked(
            block.timestamp,
            _activeNodes.length,
            anchorCount
        ));
        
        return string(abi.encodePacked("0x", _toHexString(uint256(stateHash))));
    }
    
    /**
     * @dev Helper function to convert uint256 to hex string
     */
    function _toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 16;
        }
        
        bytes memory buffer = new bytes(digits);
        for (uint256 i = digits; i > 0; i--) {
            buffer[i - 1] = bytes16("0123456789abcdef")[value & 0xf];
            value >>= 4;
        }
        
        return string(buffer);
    }
}
