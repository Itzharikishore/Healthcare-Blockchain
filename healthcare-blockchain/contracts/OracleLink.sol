// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title OracleLink
 * @dev Smart contract for AI threat analytics and anomaly detection
 * @author CoalitionCom 2.0 Team
 */
contract OracleLink {
    
    struct ThreatAlert {
        uint256 alertId;
        string alertType; // "anomaly", "suspicious_activity", "unauthorized_access", "data_breach"
        string severity; // "low", "medium", "high", "critical"
        string description;
        address[] affectedNodes;
        uint256 timestamp;
        bool isResolved;
        string aiModelVersion;
        uint256 confidenceScore; // 0-100
    }
    
    struct NodeMetrics {
        address nodeAddress;
        uint256 accessCount;
        uint256 lastAccessTime;
        uint256 suspiciousActivityCount;
        uint256 reputationScore;
        bool isFlagged;
        string lastActivity;
    }
    
    struct AIReport {
        uint256 reportId;
        string modelName;
        string analysisType;
        string findings;
        uint256 confidenceLevel;
        uint256 timestamp;
        address[] flaggedNodes;
        string recommendations;
    }
    
    address public admin;
    address public aiOracle;
    uint256 public alertCount = 0;
    uint256 public reportCount = 0;
    
    // Thresholds for anomaly detection
    uint256 public constant MAX_ACCESS_PER_HOUR = 100;
    uint256 public constant MIN_REPUTATION_SCORE = 50;
    uint256 public constant ANOMALY_THRESHOLD = 75; // Confidence score threshold
    
    mapping(uint256 => ThreatAlert) public threatAlerts;
    mapping(address => NodeMetrics) public nodeMetrics;
    mapping(uint256 => AIReport) public aiReports;
    mapping(address => bool) public authorizedOracles;
    mapping(string => bool) public activeModels;
    
    // Real-time monitoring
    mapping(address => uint256) public nodeAccessCount;
    mapping(address => uint256) public lastAccessTime;
    mapping(address => uint256) public suspiciousActivityCount;
    
    // Events
    event ThreatAlertGenerated(uint256 indexed alertId, string alertType, string severity);
    event NodeFlagged(address indexed nodeAddress, string reason);
    event NodeReputationUpdated(address indexed nodeAddress, uint256 newScore);
    event AIReportGenerated(uint256 indexed reportId, string modelName, uint256 confidenceLevel);
    event OracleAuthorized(address indexed oracle);
    event OracleDeauthorized(address indexed oracle);
    event AnomalyDetected(address indexed nodeAddress, string anomalyType, uint256 confidence);
    event EmergencyShutdown(address indexed nodeAddress, string reason);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyOracle() {
        require(authorizedOracles[msg.sender] || msg.sender == admin, "Only authorized oracles");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        aiOracle = msg.sender; // Initially admin is the oracle
    }
    
    /**
     * @dev Authorize an AI oracle
     */
    function authorizeOracle(address _oracleAddress) public onlyAdmin {
        authorizedOracles[_oracleAddress] = true;
        emit OracleAuthorized(_oracleAddress);
    }
    
    /**
     * @dev Deauthorize an AI oracle
     */
    function deauthorizeOracle(address _oracleAddress) public onlyAdmin {
        authorizedOracles[_oracleAddress] = false;
        emit OracleDeauthorized(_oracleAddress);
    }
    
    /**
     * @dev Register a new AI model
     */
    function registerAIModel(string memory _modelName) public onlyOracle {
        activeModels[_modelName] = true;
    }
    
    /**
     * @dev Submit AI threat analysis report
     */
    function submitAIReport(
        string memory _modelName,
        string memory _analysisType,
        string memory _findings,
        uint256 _confidenceLevel,
        address[] memory _flaggedNodes,
        string memory _recommendations
    ) public onlyOracle returns (uint256) {
        require(activeModels[_modelName], "Model not registered");
        require(_confidenceLevel <= 100, "Confidence level must be <= 100");
        
        reportCount++;
        
        aiReports[reportCount] = AIReport({
            reportId: reportCount,
            modelName: _modelName,
            analysisType: _analysisType,
            findings: _findings,
            confidenceLevel: _confidenceLevel,
            timestamp: block.timestamp,
            flaggedNodes: _flaggedNodes,
            recommendations: _recommendations
        });
        
        emit AIReportGenerated(reportCount, _modelName, _confidenceLevel);
        
        // Process flagged nodes
        for (uint i = 0; i < _flaggedNodes.length; i++) {
            _processFlaggedNode(_flaggedNodes[i], _findings);
        }
        
        return reportCount;
    }
    
    /**
     * @dev Generate threat alert
     */
    function generateThreatAlert(
        string memory _alertType,
        string memory _severity,
        string memory _description,
        address[] memory _affectedNodes,
        string memory _aiModelVersion,
        uint256 _confidenceScore
    ) public onlyOracle returns (uint256) {
        require(_confidenceScore >= ANOMALY_THRESHOLD, "Confidence score too low");
        
        alertCount++;
        
        threatAlerts[alertCount] = ThreatAlert({
            alertId: alertCount,
            alertType: _alertType,
            severity: _severity,
            description: _description,
            affectedNodes: _affectedNodes,
            timestamp: block.timestamp,
            isResolved: false,
            aiModelVersion: _aiModelVersion,
            confidenceScore: _confidenceScore
        });
        
        emit ThreatAlertGenerated(alertCount, _alertType, _severity);
        
        // Update node metrics for affected nodes
        for (uint i = 0; i < _affectedNodes.length; i++) {
            _updateNodeMetrics(_affectedNodes[i], true);
        }
        
        return alertCount;
    }
    
    /**
     * @dev Record node access for monitoring
     */
    function recordNodeAccess(address _nodeAddress, string memory _activity) public onlyOracle {
        nodeAccessCount[_nodeAddress]++;
        lastAccessTime[_nodeAddress] = block.timestamp;
        
        // Update node metrics
        if (nodeMetrics[_nodeAddress].nodeAddress == address(0)) {
            nodeMetrics[_nodeAddress] = NodeMetrics({
                nodeAddress: _nodeAddress,
                accessCount: 1,
                lastAccessTime: block.timestamp,
                suspiciousActivityCount: 0,
                reputationScore: 100,
                isFlagged: false,
                lastActivity: _activity
            });
        } else {
            nodeMetrics[_nodeAddress].accessCount++;
            nodeMetrics[_nodeAddress].lastAccessTime = block.timestamp;
            nodeMetrics[_nodeAddress].lastActivity = _activity;
        }
        
        // Check for anomalies
        _checkForAnomalies(_nodeAddress);
    }
    
    /**
     * @dev Check for suspicious patterns
     */
    function _checkForAnomalies(address _nodeAddress) internal {
        NodeMetrics storage metrics = nodeMetrics[_nodeAddress];
        
        // Check access frequency
        if (metrics.accessCount > MAX_ACCESS_PER_HOUR) {
            _flagNode(_nodeAddress, "Excessive access frequency");
        }
        
        // Check reputation score
        if (metrics.reputationScore < MIN_REPUTATION_SCORE) {
            _flagNode(_nodeAddress, "Low reputation score");
        }
        
        // Check for unusual patterns (simplified)
        if (block.timestamp - metrics.lastAccessTime < 60) { // Less than 1 minute
            suspiciousActivityCount[_nodeAddress]++;
            if (suspiciousActivityCount[_nodeAddress] > 5) {
                _flagNode(_nodeAddress, "Rapid successive access attempts");
            }
        }
    }
    
    /**
     * @dev Flag a suspicious node
     */
    function _flagNode(address _nodeAddress, string memory _reason) internal {
        nodeMetrics[_nodeAddress].isFlagged = true;
        nodeMetrics[_nodeAddress].suspiciousActivityCount++;
        
        emit NodeFlagged(_nodeAddress, _reason);
        
        // Generate alert if confidence is high
        if (nodeMetrics[_nodeAddress].suspiciousActivityCount > 3) {
            address[] memory affectedNodes = new address[](1);
            affectedNodes[0] = _nodeAddress;
            
            generateThreatAlert(
                "suspicious_activity",
                "high",
                string(abi.encodePacked("Node flagged: ", _reason)),
                affectedNodes,
                "v1.0",
                85
            );
        }
    }
    
    /**
     * @dev Update node reputation
     */
    function updateNodeReputation(address _nodeAddress, uint256 _newScore) public onlyOracle {
        require(_newScore <= 100, "Reputation score must be <= 100");
        
        nodeMetrics[_nodeAddress].reputationScore = _newScore;
        emit NodeReputationUpdated(_nodeAddress, _newScore);
        
        // If reputation drops below threshold, flag the node
        if (_newScore < MIN_REPUTATION_SCORE) {
            _flagNode(_nodeAddress, "Reputation score below threshold");
        }
    }
    
    /**
     * @dev Update node metrics
     */
    function _updateNodeMetrics(address _nodeAddress, bool _isSuspicious) internal {
        if (nodeMetrics[_nodeAddress].nodeAddress == address(0)) {
            nodeMetrics[_nodeAddress] = NodeMetrics({
                nodeAddress: _nodeAddress,
                accessCount: 1,
                lastAccessTime: block.timestamp,
                suspiciousActivityCount: _isSuspicious ? 1 : 0,
                reputationScore: _isSuspicious ? 90 : 100,
                isFlagged: _isSuspicious,
                lastActivity: "ai_analysis"
            });
        } else {
            nodeMetrics[_nodeAddress].accessCount++;
            nodeMetrics[_nodeAddress].lastAccessTime = block.timestamp;
            if (_isSuspicious) {
                nodeMetrics[_nodeAddress].suspiciousActivityCount++;
                nodeMetrics[_nodeAddress].reputationScore = nodeMetrics[_nodeAddress].reputationScore > 10 ? 
                    nodeMetrics[_nodeAddress].reputationScore - 10 : 0;
                nodeMetrics[_nodeAddress].isFlagged = true;
            }
        }
    }

    /**
     * @dev Process flagged node based on AI findings
     */
    function _processFlaggedNode(address _nodeAddress, string memory _findings) internal {
        nodeMetrics[_nodeAddress].isFlagged = true;
        nodeMetrics[_nodeAddress].suspiciousActivityCount++;
        
        emit AnomalyDetected(_nodeAddress, "AI-detected anomaly", 90);
        
        // If critical severity, trigger emergency shutdown
        if (nodeMetrics[_nodeAddress].suspiciousActivityCount > 5) {
            emit EmergencyShutdown(_nodeAddress, "Critical threat detected");
        }
    }
    
    /**
     * @dev Resolve threat alert
     */
    function resolveThreatAlert(uint256 _alertId) public onlyOracle {
        require(_alertId <= alertCount, "Alert does not exist");
        require(!threatAlerts[_alertId].isResolved, "Alert already resolved");
        
        threatAlerts[_alertId].isResolved = true;
    }
    
    /**
     * @dev Get node metrics
     */
    function getNodeMetrics(address _nodeAddress) public view returns (
        uint256 accessCount,
        uint256 lastAccess,
        uint256 suspiciousCount,
        uint256 reputationScore,
        bool isFlagged,
        string memory lastActivity
    ) {
        NodeMetrics memory metrics = nodeMetrics[_nodeAddress];
        return (
            metrics.accessCount,
            metrics.lastAccessTime,
            metrics.suspiciousActivityCount,
            metrics.reputationScore,
            metrics.isFlagged,
            metrics.lastActivity
        );
    }
    
    /**
     * @dev Get threat alert details
     */
    function getThreatAlert(uint256 _alertId) public view returns (
        string memory alertType,
        string memory severity,
        string memory description,
        uint256 timestamp,
        bool isResolved,
        uint256 confidenceScore
    ) {
        require(_alertId <= alertCount, "Alert does not exist");
        ThreatAlert memory alert = threatAlerts[_alertId];
        
        return (
            alert.alertType,
            alert.severity,
            alert.description,
            alert.timestamp,
            alert.isResolved,
            alert.confidenceScore
        );
    }
    
    /**
     * @dev Get AI report details
     */
    function getAIReport(uint256 _reportId) public view returns (
        string memory modelName,
        string memory analysisType,
        string memory findings,
        uint256 confidenceLevel,
        uint256 timestamp,
        string memory recommendations
    ) {
        require(_reportId <= reportCount, "Report does not exist");
        AIReport memory report = aiReports[_reportId];
        
        return (
            report.modelName,
            report.analysisType,
            report.findings,
            report.confidenceLevel,
            report.timestamp,
            report.recommendations
        );
    }
    
    /**
     * @dev Emergency shutdown of a node
     */
    function emergencyShutdown(address _nodeAddress, string memory _reason) public onlyOracle {
        nodeMetrics[_nodeAddress].isFlagged = true;
        emit EmergencyShutdown(_nodeAddress, _reason);
    }
}
