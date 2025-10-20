import React, { useState, useEffect } from 'react';

const ConnectionTest = () => {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [blockchainStatus, setBlockchainStatus] = useState('Checking...');
  const [connectionStatus, setConnectionStatus] = useState('Checking...');

  useEffect(() => {
    testConnections();
  }, []);

  const testConnections = async () => {
    // Test Backend Connection
    try {
      const backendResponse = await fetch('/api/system-status');
      const backendData = await backendResponse.json();
      setBackendStatus(`✅ Backend Connected: ${backendData.service}`);
    } catch (error) {
      setBackendStatus('❌ Backend Connection Failed');
    }

    // Test Blockchain Connection
    try {
      if (window.ethereum) {
        const provider = new window.ethereum;
        const accounts = await provider.request({ method: 'eth_accounts' });
        setBlockchainStatus(`✅ Blockchain Connected: ${accounts.length} accounts`);
      } else {
        setBlockchainStatus('❌ MetaMask not found');
      }
    } catch (error) {
      setBlockchainStatus('❌ Blockchain Connection Failed');
    }

    // Test API Health
    try {
      const healthResponse = await fetch('/api/health');
      const healthData = await healthResponse.json();
      setConnectionStatus(`✅ API Health: ${healthData.status}`);
    } catch (error) {
      setConnectionStatus('❌ API Health Check Failed');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">🔗 Connection Status</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <div>
          <strong>Backend Server:</strong>
          <br />
          <span style={{ color: backendStatus.includes('✅') ? '#2ecc71' : '#e74c3c' }}>
            {backendStatus}
          </span>
        </div>
        <div>
          <strong>Blockchain:</strong>
          <br />
          <span style={{ color: blockchainStatus.includes('✅') ? '#2ecc71' : '#e74c3c' }}>
            {blockchainStatus}
          </span>
        </div>
        <div>
          <strong>API Health:</strong>
          <br />
          <span style={{ color: connectionStatus.includes('✅') ? '#2ecc71' : '#e74c3c' }}>
            {connectionStatus}
          </span>
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <button 
          className="btn btn-primary"
          onClick={testConnections}
        >
          🔄 Test Connections
        </button>
      </div>
    </div>
  );
};

export default ConnectionTest;
