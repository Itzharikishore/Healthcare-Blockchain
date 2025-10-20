# 🛰️ CoalitionCom 2.0: Blockchain-Based Defense Intelligence Exchange

A next-generation defense intelligence sharing network that uses blockchain, AI, and zero-knowledge cryptography to allow allied nations to exchange and verify classified data securely — without revealing secrets, without central control, and with full global auditability.

## 🌟 Features

### 🔐 **Secure Encryption Layer**
- Defense data encrypted using AES-GCM before leaving a node
- Encrypted files stored in IPFS for redundancy and immutability
- Zero-Knowledge Proofs (ZKPs) for validating intelligence claims without exposing actual data

### ⛓ **Blockchain Anchor Layer**
- Ethereum-based consortium blockchain for data integrity
- Smart contracts for data record management and access control
- Immutable audit trail for all intelligence operations

### 🧠 **AI Threat Analytics**
- Machine learning oracle for continuous monitoring
- Real-time anomaly detection using Isolation Forest and Random Forest models
- Automated threat alerts and suspicious activity detection
- Node reputation scoring and behavioral analysis

### 🏛️ **DAO Governance**
- Multi-signature approval mechanism for access requests
- Decentralized Autonomous Organization (DAO) for coalition governance
- Voting system with different approval levels based on classification
- Emergency procedures for critical situations

### 🌍 **Global Chain Anchoring**
- Periodic anchoring of consortium state to public blockchain (Polygon)
- Global timestamping and auditability without revealing sensitive details
- Cross-chain verification and transparency

### 📊 **Interactive Dashboard**
- Real-time visualization of coalition activities
- Threat analytics and node monitoring
- Governance voting interface
- Global anchoring status and verification

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           CoalitionCom 2.0 Network           │
├─────────────────────────────────────────────┤
│                                             │
│  [Nation Nodes] ─────► Consortium Blockchain│
│       │                    (Ethereum/Besu)  │
│       ▼                                      │
│  ┌─────────────┐                            │
│  │Smart Contracts│                          │
│  │ • DataRecord  │                          │
│  │ • AccessDAO   │                          │
│  │ • OracleLink  │                          │
│  │ • GlobalAnchor│                          │
│  └─────────────┘                            │
│       │                                      │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Oracle Server│  │AI Threat Analytics   │ │
│  │(snarkjs, ZKP)│  │(Python/ML model)     │ │
│  └──────────────┘  └──────────────────────┘ │
│       │                 │                   │
│       ▼                 ▼                   │
│   IPFS Storage      Audit Dashboard          │
│   (Encrypted Files) (React + Ethers.js)     │
│                                             │
│      Global Chain Anchoring (Polygon)       │
└─────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd healthcare-blockchain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start local blockchain**
   ```bash
   npx hardhat node
   ```

5. **Deploy smart contracts**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

6. **Start backend server**
   ```bash
   npm run start
   ```

7. **Start frontend dashboard**
   ```bash
   npm run frontend
   ```

8. **Access the application**
   - Open http://localhost:3000 in your browser
   - Connect MetaMask to localhost:8545
   - Begin using CoalitionCom 2.0

## 📁 Project Structure

```
healthcare-blockchain/
├── contracts/                 # Smart contracts
│   ├── DataRecord.sol        # Intelligence data management
│   ├── AccessDAO.sol        # Governance and access control
│   ├── OracleLink.sol       # AI threat analytics
│   └── GlobalAnchoring.sol  # Public blockchain integration
├── frontend/                 # React dashboard
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── App.js           # Main application
│   │   └── App.css          # Styling
├── backend/                  # Node.js backend
│   └── server.js            # API server with AI analytics
├── scripts/
│   └── deploy.js            # Deployment script
├── test/                     # Test files
├── hardhat.config.js        # Hardhat configuration
└── package.json             # Dependencies
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/your-api-key

# Backend Configuration
PORT=3001
ENCRYPTION_KEY=your_encryption_key_here

# Frontend Configuration
REACT_APP_DATA_RECORD_ADDRESS=0x...
REACT_APP_ACCESS_DAO_ADDRESS=0x...
REACT_APP_ORACLE_LINK_ADDRESS=0x...
REACT_APP_GLOBAL_ANCHORING_ADDRESS=0x...
```

### Network Configuration

The system supports multiple networks:

- **Local Development**: `localhost:8545`
- **Polygon Mumbai**: `https://polygon-mumbai.g.alchemy.com/v2/...`
- **Besu Consortium**: Custom configuration

## 🧩 Smart Contracts

### DataRecord.sol
- Manages intelligence data records
- Handles ZKP verification
- Controls access permissions
- Tracks submission and verification events

### AccessDAO.sol
- Decentralized governance system
- Proposal creation and voting
- Member management
- Access rule configuration

### OracleLink.sol
- AI threat analytics integration
- Node behavior monitoring
- Anomaly detection
- Threat alert generation

### GlobalAnchoring.sol
- Public blockchain integration
- State anchoring to Polygon
- Global verification
- Timestamping and auditability

## 🤖 AI Threat Analytics

The system includes sophisticated AI-powered threat detection:

### Anomaly Detection
- **Access Pattern Analysis**: Monitors unusual access frequencies
- **Behavioral Analysis**: Detects suspicious node behavior
- **Classification Violations**: Identifies unauthorized access to high-classification data
- **Time-based Anomalies**: Flags unusual access patterns

### Machine Learning Models
- **Isolation Forest**: For outlier detection
- **Random Forest**: For classification and prediction
- **Real-time Processing**: Continuous monitoring and analysis

### Threat Response
- **Automated Alerts**: Immediate notification of threats
- **Node Flagging**: Automatic flagging of suspicious nodes
- **Reputation Scoring**: Dynamic reputation system
- **Emergency Procedures**: Critical threat response protocols

## 🏛️ Governance System

### Proposal Types
1. **Add Member**: Add new coalition members
2. **Remove Member**: Remove coalition members
3. **Change Access Rules**: Modify access control policies
4. **Emergency Action**: Critical security measures

### Voting Mechanism
- **Regular Proposals**: 3-day voting period, 30% quorum, 51% majority
- **Emergency Proposals**: 1-hour voting period, emergency members only, 75% majority
- **Voting Power**: Configurable per member
- **Transparency**: All votes recorded on blockchain

## 🌍 Global Anchoring

### Process
1. **State Collection**: Gather consortium state data
2. **Merkle Root Generation**: Create cryptographic hash
3. **Public Submission**: Submit to Polygon network
4. **Verification**: Verify on public blockchain

### Benefits
- **Immutable Timestamping**: Global time verification
- **Transparency**: Public auditability without data exposure
- **Cross-chain Verification**: Multi-blockchain validation
- **Accountability**: International oversight

## 📊 Dashboard Features

### Real-time Monitoring
- **System Status**: Network health and performance
- **Threat Alerts**: Active security threats
- **Node Metrics**: Coalition member statistics
- **Governance Activity**: Recent proposals and votes

### Intelligence Management
- **Record Submission**: Upload and encrypt intelligence data
- **Access Control**: Manage data access permissions
- **ZKP Verification**: Zero-knowledge proof validation
- **Audit Trail**: Complete operation history

### Analytics
- **Threat Analytics**: AI-powered threat detection
- **Node Behavior**: Member activity analysis
- **Governance Metrics**: Voting and proposal statistics
- **Global Anchoring**: Public blockchain integration status

## 🔒 Security Features

### Encryption
- **AES-GCM**: Advanced encryption standard
- **Key Management**: Secure key generation and storage
- **Zero-Knowledge Proofs**: Privacy-preserving verification

### Access Control
- **Multi-signature**: Multiple approvals required
- **Role-based Access**: Different permission levels
- **Time-based Expiration**: Automatic access revocation
- **Audit Logging**: Complete access history

### Threat Protection
- **AI Monitoring**: Continuous threat detection
- **Anomaly Detection**: Unusual pattern identification
- **Emergency Procedures**: Critical situation response
- **Node Isolation**: Automatic suspicious node handling

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Smart Contract Tests
```bash
npx hardhat test
```

## 🚀 Deployment

### Local Development
```bash
# Start local blockchain
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Start services
npm run dev
```

### Production Deployment
```bash
# Deploy to Polygon
npx hardhat run scripts/deploy.js --network polygon

# Start production services
npm run start:prod
```

## 📈 Performance

### Scalability
- **IPFS Integration**: Distributed file storage
- **Consortium Blockchain**: Private, high-performance network
- **AI Optimization**: Efficient threat detection algorithms
- **Caching**: Smart contract result caching

### Monitoring
- **Real-time Metrics**: System performance monitoring
- **Health Checks**: Automated system health verification
- **Alerting**: Proactive issue notification
- **Logging**: Comprehensive operation logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Roadmap

### Phase 1: Core Implementation ✅
- Smart contract development
- Basic frontend dashboard
- AI threat analytics
- Governance system

### Phase 2: Advanced Features 🚧
- Post-Quantum Encryption (PQC)
- Interplanetary Defense Communication
- Hyperledger Fabric integration
- Reputation tokenomics

### Phase 3: Production Deployment 📋
- Cloud and edge hybrid network
- Real consortium deployment
- International compliance
- Advanced AI models

---

**CoalitionCom 2.0** - Secure Defense Intelligence for the Modern World 🛰️