import React, { useState, useEffect } from 'react';

const ThreatAnalytics = ({ contracts, account }) => {
  const [threatAlerts, setThreatAlerts] = useState([]);
  const [nodeMetrics, setNodeMetrics] = useState({});
  const [aiReports, setAiReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    fetchThreatData();
    const interval = setInterval(fetchThreatData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchThreatData = async () => {
    try {
      setLoading(true);
      
      // Fetch threat alerts
      const alertsResponse = await fetch('/api/threat-alerts');
      const alerts = await alertsResponse.json();
      setThreatAlerts(alerts.alerts || generateMockAlerts());

      // Fetch AI reports
      const reportsResponse = await fetch('/api/generate-ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisType: 'comprehensive', timeRange: '24h' })
      });
      const reports = await reportsResponse.json();
      setAiReports(reports.report ? [reports.report] : []);

      // Generate mock node metrics
      setNodeMetrics(generateMockNodeMetrics());
      
    } catch (error) {
      console.error('Failed to fetch threat data:', error);
      setThreatAlerts(generateMockAlerts());
      setNodeMetrics(generateMockNodeMetrics());
    } finally {
      setLoading(false);
    }
  };

  const generateMockAlerts = () => {
    const alertTypes = ['anomaly', 'suspicious_activity', 'unauthorized_access', 'data_breach'];
    const severities = ['low', 'medium', 'high', 'critical'];
    
    return Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      alertType: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      description: `Threat detected: ${alertTypes[Math.floor(Math.random() * alertTypes.length)]}`,
      nodeAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      confidence: Math.floor(Math.random() * 30) + 70,
      timestamp: new Date(Date.now() - Math.random() * 86400000),
      isResolved: Math.random() > 0.7
    }));
  };

  const generateMockNodeMetrics = () => {
    const nodes = Array.from({ length: 12 }, (_, i) => ({
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      nationCode: ['USA', 'UK', 'NATO', 'DEU', 'FRA', 'CAN'][Math.floor(Math.random() * 6)],
      accessCount: Math.floor(Math.random() * 1000),
      lastAccessTime: Date.now() - Math.random() * 86400000,
      suspiciousActivityCount: Math.floor(Math.random() * 10),
      reputationScore: Math.floor(Math.random() * 40) + 60,
      isFlagged: Math.random() > 0.8,
      lastActivity: ['file_upload', 'data_access', 'record_submission'][Math.floor(Math.random() * 3)]
    }));

    return nodes.reduce((acc, node) => {
      acc[node.address] = node;
      return acc;
    }, {});
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return 'status-operational';
      case 'medium': return 'status-warning';
      case 'high': return 'status-critical';
      case 'critical': return 'status-critical';
      default: return 'status-operational';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🟠';
      case 'critical': return '🔴';
      default: return '⚪';
    }
  };

  const getReputationColor = (score) => {
    if (score >= 90) return 'status-operational';
    if (score >= 70) return 'status-warning';
    return 'status-critical';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center">
          <div className="loading"></div>
          <p className="mt-2">Loading threat analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <h2>🛡️ Threat Analytics</h2>
        <p className="text-muted">AI-powered threat detection and anomaly analysis</p>
      </div>

      {/* Threat Overview */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🚨 Active Alerts</h3>
          </div>
          <div className="card-value" style={{ color: '#e74c3c' }}>
            {threatAlerts.filter(a => !a.isResolved).length}
          </div>
          <div className="card-description">Unresolved security threats</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔍 Monitored Nodes</h3>
          </div>
          <div className="card-value">{Object.keys(nodeMetrics).length}</div>
          <div className="card-description">Active coalition nodes</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚠️ Flagged Nodes</h3>
          </div>
          <div className="card-value" style={{ color: '#f1c40f' }}>
            {Object.values(nodeMetrics).filter(n => n.isFlagged).length}
          </div>
          <div className="card-description">Nodes under investigation</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🤖 AI Confidence</h3>
          </div>
          <div className="card-value">94%</div>
          <div className="card-description">Threat detection accuracy</div>
        </div>
      </div>

      {/* Threat Alerts */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🚨 Threat Alerts</h3>
          <button className="btn btn-secondary">Generate Report</button>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Description</th>
                <th>Node</th>
                <th>Confidence</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {threatAlerts.map((alert) => (
                <tr key={alert.id}>
                  <td>#{alert.id}</td>
                  <td>
                    <span className="status-indicator status-operational">
                      {alert.alertType.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-indicator ${getSeverityColor(alert.severity)}`}>
                      {getSeverityIcon(alert.severity)} {alert.severity.toUpperCase()}
                    </span>
                  </td>
                  <td>{alert.description}</td>
                  <td>
                    <code style={{ fontSize: '0.8rem' }}>
                      {alert.nodeAddress.slice(0, 6)}...{alert.nodeAddress.slice(-4)}
                    </code>
                  </td>
                  <td>{alert.confidence}%</td>
                  <td>{alert.timestamp.toLocaleString()}</td>
                  <td>
                    <span className={`status-indicator ${alert.isResolved ? 'status-operational' : 'status-warning'}`}>
                      {alert.isResolved ? '✅ Resolved' : '⏳ Active'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                        Investigate
                      </button>
                      {!alert.isResolved && (
                        <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                          Resolve
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

      {/* Node Metrics */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📊 Node Metrics</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select className="form-select" style={{ width: 'auto' }}>
              <option>All Nations</option>
              <option>USA</option>
              <option>UK</option>
              <option>NATO</option>
              <option>DEU</option>
              <option>FRA</option>
              <option>CAN</option>
            </select>
            <button className="btn btn-secondary">Export Data</button>
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Node Address</th>
                <th>Nation</th>
                <th>Access Count</th>
                <th>Reputation</th>
                <th>Suspicious Activity</th>
                <th>Last Activity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(nodeMetrics).map((node) => (
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
                  <td>{node.accessCount.toLocaleString()}</td>
                  <td>
                    <span className={`status-indicator ${getReputationColor(node.reputationScore)}`}>
                      {node.reputationScore}/100
                    </span>
                  </td>
                  <td>{node.suspiciousActivityCount}</td>
                  <td>{new Date(node.lastAccessTime).toLocaleString()}</td>
                  <td>
                    <span className={`status-indicator ${node.isFlagged ? 'status-critical' : 'status-operational'}`}>
                      {node.isFlagged ? '🚩 Flagged' : '✅ Normal'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        onClick={() => setSelectedNode(node)}
                      >
                        Details
                      </button>
                      {node.isFlagged && (
                        <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                          Suspend
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

      {/* AI Reports */}
      {aiReports.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🤖 AI Analysis Reports</h3>
          </div>
          {aiReports.map((report, index) => (
            <div key={index} style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(74, 144, 226, 0.05)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong>Report #{report.reportId}</strong>
                <span className="status-indicator status-operational">
                  {report.confidenceLevel}% Confidence
                </span>
              </div>
              <p><strong>Model:</strong> {report.modelName}</p>
              <p><strong>Analysis Type:</strong> {report.analysisType}</p>
              <p><strong>Findings:</strong> {report.findings}</p>
              <p><strong>Recommendations:</strong> {report.recommendations}</p>
            </div>
          ))}
        </div>
      )}

      {/* Node Details Modal */}
      {selectedNode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '600px', maxWidth: '90vw' }}>
            <div className="card-header">
              <h3 className="card-title">Node Details</h3>
              <button 
                onClick={() => setSelectedNode(null)}
                style={{ background: 'none', border: 'none', color: '#b8c5d1', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <strong>Address:</strong>
                <br />
                <code style={{ fontSize: '0.8rem' }}>{selectedNode.address}</code>
              </div>
              <div>
                <strong>Nation:</strong>
                <br />
                <span className="status-indicator status-operational">{selectedNode.nationCode}</span>
              </div>
              <div>
                <strong>Access Count:</strong>
                <br />
                {selectedNode.accessCount.toLocaleString()}
              </div>
              <div>
                <strong>Reputation Score:</strong>
                <br />
                <span className={`status-indicator ${getReputationColor(selectedNode.reputationScore)}`}>
                  {selectedNode.reputationScore}/100
                </span>
              </div>
              <div>
                <strong>Suspicious Activity:</strong>
                <br />
                {selectedNode.suspiciousActivityCount} incidents
              </div>
              <div>
                <strong>Last Activity:</strong>
                <br />
                {new Date(selectedNode.lastAccessTime).toLocaleString()}
              </div>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedNode(null)}
              >
                Close
              </button>
              <button className="btn btn-primary">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatAnalytics;
