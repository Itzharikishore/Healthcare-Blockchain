import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Components
import Dashboard from './components/Dashboard';
import IntelligenceRecords from './components/IntelligenceRecords';
import ThreatAnalytics from './components/ThreatAnalytics';
import Governance from './components/Governance';
import GlobalAnchoring from './components/GlobalAnchoring';
import Navigation from './components/Navigation';

// Contract ABIs (simplified)
const DataRecordABI = [
  "function recordCount() view returns (uint256)",
  "function getRecord(uint256) view returns (uint256,address,string,string,string,bool,uint256)",
  "function submitIntelligenceRecord(string,string,string,string) returns (uint256)",
  "function verifyRecordWithZKP(uint256,string)",
  "event RecordSubmitted(uint256 indexed, address indexed, string)"
];

const AccessDAOABI = [
  "function proposalCount() view returns (uint256)",
  "function createProposal(string,string,uint256) returns (uint256)",
  "function vote(uint256,bool)",
  "function executeProposal(uint256)",
  "function getProposal(uint256) view returns (uint256,address,string,string,uint256,uint256,uint256,uint256,uint256,bool,bool)",
  "event ProposalCreated(uint256 indexed, address indexed, string)"
];

const OracleLinkABI = [
  "function alertCount() view returns (uint256)",
  "function getThreatAlert(uint256) view returns (string,string,string,uint256,bool,uint256)",
  "function getNodeMetrics(address) view returns (uint256,uint256,uint256,uint256,bool,string)",
  "event ThreatAlertGenerated(uint256 indexed, string, string)"
];

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState({});
  const [systemStatus, setSystemStatus] = useState({});

  // Initialize Web3 connection
  useEffect(() => {
    initializeWeb3();
    fetchSystemStatus();
  }, []);

  const initializeWeb3 = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const account = await signer.getAddress();

        setProvider(provider);
        setSigner(signer);
        setAccount(account);

        // Initialize contracts (using placeholder addresses)
        const dataRecordContract = new ethers.Contract(
          process.env.REACT_APP_DATA_RECORD_ADDRESS || "0x1234567890123456789012345678901234567890",
          DataRecordABI,
          signer
        );

        const accessDAOContract = new ethers.Contract(
          process.env.REACT_APP_ACCESS_DAO_ADDRESS || "0x1234567890123456789012345678901234567890",
          AccessDAOABI,
          signer
        );

        const oracleLinkContract = new ethers.Contract(
          process.env.REACT_APP_ORACLE_LINK_ADDRESS || "0x1234567890123456789012345678901234567890",
          OracleLinkABI,
          signer
        );

        setContracts({
          dataRecord: dataRecordContract,
          accessDAO: accessDAOContract,
          oracleLink: oracleLinkContract
        });

        console.log('✅ Web3 connection established');
      } else {
        console.error('❌ MetaMask not found');
      }
    } catch (error) {
      console.error('Web3 initialization error:', error);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/system-status');
      const status = await response.json();
      setSystemStatus(status);
    } catch (error) {
      console.error('Failed to fetch system status:', error);
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
          systemStatus={systemStatus}
          contracts={contracts}
          account={account}
        />;
      case 'records':
        return <IntelligenceRecords 
          contracts={contracts}
          account={account}
        />;
      case 'threats':
        return <ThreatAnalytics 
          contracts={contracts}
          account={account}
        />;
      case 'governance':
        return <Governance 
          contracts={contracts}
          account={account}
        />;
      case 'anchoring':
        return <GlobalAnchoring 
          contracts={contracts}
          account={account}
        />;
      default:
        return <Dashboard 
          systemStatus={systemStatus}
          contracts={contracts}
          account={account}
        />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>🛰️ CoalitionCom 2.0</h1>
          <p>Blockchain-Based Defense Intelligence Exchange</p>
          {account && (
            <div className="account-info">
              <span>Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
            </div>
          )}
        </div>
      </header>

      <Navigation 
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <main className="main-content">
        {renderCurrentView()}
      </main>

      <footer className="app-footer">
        <p>© 2024 CoalitionCom 2.0 - Secure Defense Intelligence Network</p>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#security">Security</a>
          <a href="#support">Support</a>
        </div>
      </footer>
    </div>
  );
}

export default App;
