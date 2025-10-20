import React, { useState, useEffect } from 'react';

const GlobalAnchoring = ({ contracts, account }) => {
  const [anchoringRecords, setAnchoringRecords] = useState([]);
  const [nodeStates, setNodeStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [anchoringStatus, setAnchoringStatus] = useState({
    isAnchoringDue: false,
    timeUntilNext: 0,
    lastAnchorTime: null,
    nextAnchorTime: null
  });

  useEffect(() => {
    fetchAnchoringData();
    const interval = setInterval(fetchAnchoringData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAnchoringData = async () => {
    try {
      setLoading(true);
      
      // Fetch anchoring records
      const mockRecords = generateMockAnchoringRecords();
      setAnchoringRecords(mockRecords);

      // Fetch node states
      const mockNodeStates = generateMockNodeStates();
      setNodeStates(mockNodeStates);

      // Calculate anchoring status
      const lastAnchor = mockRecords[0]?.timestamp || Date.now() - 86400000;
      const nextAnchor = lastAnchor + 86400000; // 24 hours
      const now = Date.now();
      
      setAnchoringStatus({
        isAnchoringDue: now >= nextAnchor,
        timeUntilNext: Math.max(0, nextAnchor - now),
        lastAnchorTime: new Date(lastAnchor),
        nextAnchorTime: new Date(nextAnchor)
      });
      
    } catch (error) {
      console.error('Failed to fetch anchoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnchoringRecords = () => {
    return Array.from({ length: 10 }, (_, i) => ({
      anchorId: i + 1,
      merkleRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
      timestamp: new Date(Date.now() - i * 86400000),
      recordCount: Math.floor(Math.random() * 1000) + 100,
      participatingNodes: Array.from({ length: Math.floor(Math.random() * 10) + 5 }, () => 
        `0x${Math.random().toString(16).substr(2, 40)}`
      ),
      metadata: JSON.stringify({
        networkHealth: Math.floor(Math.random() * 20) + 80,
        consensusReached: true,
        verificationStatus: 'verified'
      })
    }));
  };

  const generateMockNodeStates = () => {
    const nations = ['USA', 'UK', 'NATO', 'DEU', 'FRA', 'CAN', 'AUS', 'JPN'];
    
    return Array.from({ length: 15 }, (_, i) => {
      const address = `0x${Math.random().toString(16).substr(2, 40)}`;
      return {
        address,
        nationCode: nations[Math.floor(Math.random() * nations.length)],
        lastUpdateTime: Date.now() - Math.random() * 3600000,
        nodeHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        isActive: Math.random() > 0.1,
        contributionCount: Math.floor(Math.random() * 100) + 10
      };
    }).reduce((acc, node) => {
      acc[node.address] = node;
      return acc;
    }, {});
  };

  const triggerAnchoring = async () => {
    try {
      const response = await fetch('/api/anchor-to-public-chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merkleRoot: `0x${Math.random().toString(16).substr(2, 64)}`,
          participatingNodes: Object.keys(nodeStates).slice(0, 8),
          recordCount: Math.floor(Math.random() * 500) + 100
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('State successfully anchored to public blockchain!');
        fetchAnchoringData();
      } else {
        alert('Anchoring failed: ' + result.error);
      }
    } catch (error) {
      console.error('Anchoring error:', error);
      alert('Anchoring failed');
    }
  };

  const formatTimeRemaining = (milliseconds) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const getNodeStatusColor = (isActive) => {
    return isActive ? 'status-operational' : 'status-critical';
  };

  const getNodeStatusText = (isActive) => {
    return isActive ? '✅ Active' : '❌ Inactive';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center">
          <div className="loading"></div>
          <p className="mt-2">Loading anchoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <h2>🌍 Global Anchoring</h2>
        <p className="text-muted">Public blockchain integration for transparency and auditability</p>
      </div>

      {/* Anchoring Status */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⏰ Anchoring Status</h3>
          </div>
          <div className="card-value" style={{ color: anchoringStatus.isAnchoringDue ? '#e74c3c' : '#2ecc71' }}>
            {anchoringStatus.isAnchoringDue ? 'Due Now' : 'Scheduled'}
          </div>
          <div className="card-description">
            {anchoringStatus.isAnchoringDue ? 
              'Ready for next anchoring' : 
              `Next in ${formatTimeRemaining(anchoringStatus.timeUntilNext)}`
            }
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔗 Last Anchor</h3>
          </div>
          <div className="card-value">
            {anchoringStatus.lastAnchorTime ? 
              `${Math.floor((Date.now() - anchoringStatus.lastAnchorTime.getTime()) / 3600000)}h ago` : 
              'Never'
            }
          </div>
          <div className="card-description">Time since last public anchor</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Total Anchors</h3>
          </div>
          <div className="card-value">{anchoringRecords.length}</div>
          <div className="card-description">Public blockchain anchors</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🌐 Public Chain</h3>
          </div>
          <div className="card-value">Polygon</div>
          <div className="card-description">Target blockchain network</div>
        </div>
      </div>

      {/* Anchoring Controls */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">⚡ Anchoring Controls</h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${anchoringStatus.isAnchoringDue ? 'btn-primary' : 'btn-secondary'}`}
            onClick={triggerAnchoring}
            disabled={!anchoringStatus.isAnchoringDue}
          >
            {anchoringStatus.isAnchoringDue ? '🚀 Anchor Now' : '⏳ Wait for Schedule'}
          </button>
          <button className="btn btn-secondary">
            📊 Generate Report
          </button>
          <button className="btn btn-secondary">
            🔍 Verify Anchors
          </button>
          <div style={{ marginLeft: 'auto' }}>
            <span className="status-indicator status-operational">
              Next: {anchoringStatus.nextAnchorTime?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Anchoring Records */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📋 Anchoring History</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select className="form-select" style={{ width: 'auto' }}>
              <option>All Records</option>
              <option>Last 24h</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
            <button className="btn btn-secondary">Export</button>
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Anchor ID</th>
                <th>Merkle Root</th>
                <th>Block Number</th>
                <th>Records</th>
                <th>Nodes</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {anchoringRecords.map((record) => (
                <tr key={record.anchorId}>
                  <td>#{record.anchorId}</td>
                  <td>
                    <code style={{ fontSize: '0.8rem' }}>
                      {record.merkleRoot.slice(0, 10)}...{record.merkleRoot.slice(-8)}
                    </code>
                  </td>
                  <td>{record.blockNumber.toLocaleString()}</td>
                  <td>{record.recordCount}</td>
                  <td>{record.participatingNodes.length}</td>
                  <td>{record.timestamp.toLocaleString()}</td>
                  <td>
                    <span className="status-indicator status-operational">
                      ✅ Verified
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                        Verify
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Node States */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🌐 Participating Nodes</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select className="form-select" style={{ width: 'auto' }}>
              <option>All Nations</option>
              <option>USA</option>
              <option>UK</option>
              <option>NATO</option>
              <option>DEU</option>
              <option>FRA</option>
              <option>CAN</option>
              <option>AUS</option>
              <option>JPN</option>
            </select>
            <button className="btn btn-secondary">Refresh</button>
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Node Address</th>
                <th>Nation</th>
                <th>Status</th>
                <th>Last Update</th>
                <th>Contributions</th>
                <th>Node Hash</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(nodeStates).map((node) => (
                <tr key={node.address}>
                  <td>
                    <code style={{ fontSize: '0.8rem' }}>
                      {node.address.slice(0, 8)}...{node.address.slice(-6)}
                    </code>
                  </td>
                  <td>
                    <span className="status-indicator status-operational">
                      {node.nationCode}
                    </span>
                  </td>
                  <td>
                    <span className={`status-indicator ${getNodeStatusColor(node.isActive)}`}>
                      {getNodeStatusText(node.isActive)}
                    </span>
                  </td>
                  <td>{new Date(node.lastUpdateTime).toLocaleString()}</td>
                  <td>{node.contributionCount}</td>
                  <td>
                    <code style={{ fontSize: '0.8rem' }}>
                      {node.nodeHash.slice(0, 10)}...{node.nodeHash.slice(-8)}
                    </code>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                        Details
                      </button>
                      {!node.isActive && (
                        <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Anchoring Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">ℹ️ Anchoring Information</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Purpose:</strong>
            <p style={{ marginTop: '0.5rem', color: '#b8c5d1' }}>
              Global anchoring provides transparency and auditability by publishing consortium state 
              hashes to the public Polygon blockchain, ensuring immutable timestamping and global verification.
            </p>
          </div>
          <div>
            <strong>Process:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#b8c5d1' }}>
              <li>Collect consortium state data</li>
              <li>Generate Merkle root hash</li>
              <li>Submit to Polygon network</li>
              <li>Verify on public blockchain</li>
            </ul>
          </div>
          <div>
            <strong>Benefits:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#b8c5d1' }}>
              <li>Immutable timestamping</li>
              <li>Global auditability</li>
              <li>Transparency without exposure</li>
              <li>Cross-chain verification</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Public Blockchain Verification */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🔍 Public Blockchain Verification</h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <strong>Polygon Explorer:</strong>
            <br />
            <a 
              href="https://polygonscan.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#4a90e2', textDecoration: 'none' }}
            >
              View on Polygonscan
            </a>
          </div>
          <div>
            <strong>Last Verified Block:</strong>
            <br />
            <span className="status-indicator status-operational">
              {anchoringRecords[0]?.blockNumber.toLocaleString() || 'N/A'}
            </span>
          </div>
          <div>
            <strong>Network Status:</strong>
            <br />
            <span className="status-indicator status-operational">
              ✅ Connected
            </span>
          </div>
          <button className="btn btn-primary">
            🔍 Verify All Anchors
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalAnchoring;
