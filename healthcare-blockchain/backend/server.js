const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const axios = require('axios');
const { ethers } = require('ethers');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// AI Threat Analytics Module
class AIThreatAnalytics {
    constructor() {
        this.nodeMetrics = new Map();
        this.anomalyThreshold = 0.75;
        this.accessPatterns = new Map();
    }

    // Analyze node behavior for anomalies
    analyzeNodeBehavior(nodeAddress, activityData) {
        const metrics = this.nodeMetrics.get(nodeAddress) || {
            accessCount: 0,
            lastAccessTime: 0,
            suspiciousActivityCount: 0,
            reputationScore: 100,
            accessPatterns: []
        };

        // Update metrics
        metrics.accessCount++;
        metrics.lastAccessTime = Date.now();
        metrics.accessPatterns.push({
            timestamp: Date.now(),
            activity: activityData.activity,
            dataType: activityData.dataType,
            classification: activityData.classification
        });

        // Keep only last 100 patterns for analysis
        if (metrics.accessPatterns.length > 100) {
            metrics.accessPatterns = metrics.accessPatterns.slice(-100);
        }

        // Anomaly detection algorithms
        const anomalies = this.detectAnomalies(metrics);
        
        if (anomalies.length > 0) {
            this.handleAnomalies(nodeAddress, anomalies, metrics);
        }

        this.nodeMetrics.set(nodeAddress, metrics);
        return { metrics, anomalies };
    }

    // Detect various types of anomalies
    detectAnomalies(metrics) {
        const anomalies = [];

        // 1. Excessive access frequency
        const recentAccesses = metrics.accessPatterns.filter(
            pattern => Date.now() - pattern.timestamp < 3600000 // Last hour
        );
        if (recentAccesses.length > 50) {
            anomalies.push({
                type: 'excessive_access',
                severity: 'high',
                confidence: 0.9,
                description: 'Node accessing data at unusually high frequency'
            });
        }

        // 2. Unusual access patterns
        const dataTypes = recentAccesses.map(p => p.dataType);
        const uniqueTypes = new Set(dataTypes);
        if (uniqueTypes.size > 5) {
            anomalies.push({
                type: 'diverse_access',
                severity: 'medium',
                confidence: 0.7,
                description: 'Node accessing unusually diverse data types'
            });
        }

        // 3. Classification level violations
        const highClassAccess = recentAccesses.filter(
            p => p.classification === 'top_secret'
        );
        if (highClassAccess.length > 10) {
            anomalies.push({
                type: 'classification_violation',
                severity: 'critical',
                confidence: 0.95,
                description: 'Excessive access to top-secret data'
            });
        }

        return anomalies;
    }

    // Handle detected anomalies
    handleAnomalies(nodeAddress, anomalies, metrics) {
        anomalies.forEach(anomaly => {
            if (anomaly.confidence >= this.anomalyThreshold) {
                metrics.suspiciousActivityCount++;
                metrics.reputationScore = Math.max(0, metrics.reputationScore - 10);

                // Generate threat alert
                this.generateThreatAlert(nodeAddress, anomaly);
            }
        });
    }

    // Generate threat alert
    generateThreatAlert(nodeAddress, anomaly) {
        const alert = {
            nodeAddress,
            alertType: anomaly.type,
            severity: anomaly.severity,
            confidence: anomaly.confidence,
            description: anomaly.description,
            timestamp: Date.now(),
            recommendations: this.getRecommendations(anomaly.type)
        };

        console.log(`🚨 THREAT ALERT: ${JSON.stringify(alert, null, 2)}`);
        
        return alert;
    }

    // Get recommendations based on anomaly type
    getRecommendations(anomalyType) {
        const recommendations = {
            'excessive_access': 'Review access permissions and implement rate limiting',
            'diverse_access': 'Investigate if node has legitimate need for diverse data access',
            'classification_violation': 'Immediate security review and potential access suspension',
            'unusual_timing': 'Verify if access is authorized for current time zone and mission'
        };

        return recommendations[anomalyType] || 'General security review recommended';
    }

    // Get node metrics
    getNodeMetrics(nodeAddress) {
        return this.nodeMetrics.get(nodeAddress) || {
            accessCount: 0,
            lastAccessTime: 0,
            suspiciousActivityCount: 0,
            reputationScore: 100,
            accessPatterns: []
        };
    }
}

// Initialize AI analytics
const aiAnalytics = new AIThreatAnalytics();

// Encryption utilities
class EncryptionUtils {
    static encryptData(data, key) {
        const algorithm = 'aes-256-gcm';
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(algorithm, key);
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    }

    static decryptData(encryptedData, key, iv, authTag) {
        const algorithm = 'aes-256-gcm';
        const decipher = crypto.createDecipher(algorithm, key);
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));
        
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    static generateHash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}

// Zero-Knowledge Proof utilities (simplified)
class ZKPUtils {
    static generateProof(secret, publicInput) {
        // Simplified ZKP generation
        const proof = {
            secretHash: EncryptionUtils.generateHash(secret),
            publicInput,
            timestamp: Date.now(),
            proofId: crypto.randomBytes(32).toString('hex')
        };
        
        return proof;
    }

    static verifyProof(proof, publicInput) {
        // Simplified ZKP verification
        return proof.publicInput === publicInput && proof.timestamp > 0;
    }
}

// Routes

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'CoalitionCom 2.0 Backend'
    });
});

// Upload and encrypt intelligence data
app.post('/api/upload-intelligence', upload.single('file'), async (req, res) => {
    try {
        const { dataType, classification, metadata } = req.body;
        const file = req.file;
        
        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        // Encrypt the file
        const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
        const encryptedData = EncryptionUtils.encryptData(file.buffer.toString('base64'), encryptionKey);
        
        // Simulate IPFS upload (using hash instead)
        const ipfsHash = `Qm${crypto.randomBytes(20).toString('hex')}`;
        
        // Generate ZKP proof
        const zkpProof = ZKPUtils.generateProof(
            file.buffer.toString('base64'),
            { dataType, classification, timestamp: Date.now() }
        );
        
        // Analyze for threats
        const nodeAddress = req.headers['x-node-address'] || 'unknown';
        const analysisResult = aiAnalytics.analyzeNodeBehavior(nodeAddress, {
            activity: 'file_upload',
            dataType,
            classification,
            timestamp: Date.now()
        });
        
        res.json({
            success: true,
            ipfsHash,
            zkpProof,
            threatAnalysis: analysisResult,
            recordId: Date.now() // This would come from smart contract
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Get node metrics
app.get('/api/node-metrics/:nodeAddress', (req, res) => {
    const { nodeAddress } = req.params;
    const metrics = aiAnalytics.getNodeMetrics(nodeAddress);
    
    res.json({
        nodeAddress,
        metrics,
        timestamp: new Date().toISOString()
    });
});

// Get threat alerts
app.get('/api/threat-alerts', (req, res) => {
    // In a real implementation, this would query the smart contract
    res.json({
        alerts: [],
        totalAlerts: 0,
        timestamp: new Date().toISOString()
    });
});

// Generate AI report
app.post('/api/generate-ai-report', async (req, res) => {
    try {
        const { analysisType, timeRange } = req.body;
        
        // Simulate AI analysis
        const report = {
            reportId: Date.now(),
            modelName: 'CoalitionCom-AI-v1.0',
            analysisType,
            findings: 'Simulated AI analysis findings',
            confidenceLevel: 85,
            timestamp: Date.now(),
            flaggedNodes: [],
            recommendations: 'Implement additional monitoring and review access patterns'
        };
        
        res.json({
            success: true,
            report
        });
        
    } catch (error) {
        console.error('AI report generation error:', error);
        res.status(500).json({ error: 'Report generation failed' });
    }
});

// Global anchoring endpoint
app.post('/api/anchor-to-public-chain', async (req, res) => {
    try {
        const { merkleRoot, participatingNodes, recordCount } = req.body;
        
        // In a real implementation, this would interact with Polygon
        const anchoringResult = {
            anchorId: Date.now(),
            merkleRoot,
            publicBlockNumber: Math.floor(Math.random() * 1000000), // Simulated
            timestamp: Date.now(),
            status: 'anchored'
        };
        
        res.json({
            success: true,
            anchoringResult
        });
        
    } catch (error) {
        console.error('Anchoring error:', error);
        res.status(500).json({ error: 'Anchoring failed' });
    }
});

// Get system status
app.get('/api/system-status', (req, res) => {
    res.json({
        status: 'operational',
        activeNodes: aiAnalytics.nodeMetrics.size,
        totalAlerts: 0,
        lastAnchoring: Date.now() - 86400000, // 24 hours ago
        nextAnchoring: Date.now() + 3600000, // 1 hour from now
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CoalitionCom 2.0 Backend running on port ${PORT}`);
    console.log(`📊 AI Threat Analytics initialized`);
    console.log(`🔐 Encryption utilities ready`);
    console.log(`🌐 Backend API active at http://localhost:${PORT}`);
});

module.exports = app;
