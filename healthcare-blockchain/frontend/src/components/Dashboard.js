import React, { useState, useEffect } from 'react';
import ConnectionTest from './ConnectionTest';

const Dashboard = ({ systemStatus, contracts, account }) => {
  const [metrics, setMetrics] = useState({
    totalRecords: 0,
    activeNodes: 0,
    threatAlerts: 0,
    governanceProposals: 0,
    lastAnchoring: null,
    systemHealth: 'operational'
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from contracts and backend
      const [recordsData, systemData] = await Promise.all([
        fetchSystemMetrics(),
        fetchSystemStatus()
      ]);

      setMetrics(recordsData);
      setRecentActivity(recordsData.recentActivity || []);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemMetrics = async () => {
    try {
      // Simulate contract calls
      const totalRecords = Math.floor(Math.random() * 1000) + 500;
      const activeNodes = Math.floor(Math.random() * 50) + 20;
      const threatAlerts = Math.floor(Math.random() * 10);
      const governanceProposals = Math.floor(Math.random() * 5);

      return {
        totalRecords,
        activeNodes,
        threatAlerts,
        governanceProposals,
        lastAnchoring: new Date(Date.now() - Math.random() * 86400000),
        systemHealth: threatAlerts > 5 ? 'warning' : 'operational',
        recentActivity: generateRecentActivity()
      };
    } catch (error) {
      console.error('Error fetching system metrics:', error);
      return {
        totalRecords: 0,
        activeNodes: 0,
        threatAlerts: 0,
        governanceProposals: 0,
        lastAnchoring: null,
        systemHealth: 'error',
        recentActivity: []
      };
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch('/api/system-status');
      return await response.json();
    } catch (error) {
      console.error('Error fetching system status:', error);
      return systemStatus;
    }
  };

  const generateRecentActivity = () => {
    const activities = [
      { type: 'record_submitted', description: 'New intelligence record submitted', timestamp: new Date() },
      { type: 'threat_detected', description: 'AI detected suspicious activity', timestamp: new Date(Date.now() - 300000) },
      { type: 'proposal_created', description: 'New governance proposal created', timestamp: new Date(Date.now() - 600000) },
      { type: 'anchoring_completed', description: 'State anchored to Polygon', timestamp: new Date(Date.now() - 900000) },
      { type: 'access_granted', description: 'Access request approved', timestamp: new Date(Date.now() - 1200000) }
    ];

    return activities.slice(0, 5);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'status-operational';
      case 'warning': return 'status-warning';
      case 'critical': return 'status-critical';
      default: return 'status-operational';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'operational': return '🟢 Operational';
      case 'warning': return '🟡 Warning';
      case 'critical': return '🔴 Critical';
      default: return '⚪ Unknown';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center">
          <div className="loading"></div>
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <h2>🛰️ CoalitionCom 2.0 Dashboard</h2>
        <p className="text-muted">Real-time defense intelligence network monitoring</p>
      </div>

      {/* System Status Overview */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 System Status</h3>
            <span className={`status-indicator ${getStatusColor(metrics.systemHealth)}`}>
              {getStatusText(metrics.systemHealth)}
            </span>
          </div>
          <div className="card-value">{metrics.activeNodes}</div>
          <div className="card-description">Active coalition nodes</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📁 Intelligence Records</h3>
          </div>
          <div className="card-value">{metrics.totalRecords.toLocaleString()}</div>
          <div className="card-description">Total classified records</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🛡️ Threat Alerts</h3>
          </div>
          <div className="card-value" style={{ color: metrics.threatAlerts > 0 ? '#e74c3c' : '#2ecc71' }}>
            {metrics.threatAlerts}
          </div>
          <div className="card-description">Active security alerts</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🏛️ Governance</h3>
          </div>
          <div className="card-value">{metrics.governanceProposals}</div>
          <div className="card-description">Active proposals</div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔐 Security Score</h3>
          </div>
          <div className="card-value">98%</div>
          <div className="card-description">Network security rating</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🌍 Global Anchoring</h3>
          </div>
          <div className="card-value">
            {metrics.lastAnchoring ? 
              `${Math.floor((Date.now() - metrics.lastAnchoring.getTime()) / 3600000)}h ago` : 
              'Never'
            }
          </div>
          <div className="card-description">Last public blockchain anchor</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🤖 AI Analytics</h3>
          </div>
          <div className="card-value">Active</div>
          <div className="card-description">Threat detection running</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔗 Network Health</h3>
          </div>
          <div className="card-value">99.9%</div>
          <div className="card-description">Uptime and reliability</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📈 Recent Activity</h3>
          <button className="btn btn-secondary">View All</button>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity, index) => (
                <tr key={index}>
                  <td>
                    <span className="status-indicator status-operational">
                      {activity.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>{activity.description}</td>
                  <td>{activity.timestamp.toLocaleString()}</td>
                  <td>
                    <span className="status-indicator status-operational">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">⚡ Quick Actions</h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary">
            📁 Submit Intelligence
          </button>
          <button className="btn btn-secondary">
            🛡️ View Threats
          </button>
          <button className="btn btn-secondary">
            🏛️ Create Proposal
          </button>
          <button className="btn btn-secondary">
            🌍 Anchor State
          </button>
        </div>
      </div>

      {/* System Alerts */}
      {metrics.threatAlerts > 0 && (
        <div className="alert alert-warning">
          <strong>⚠️ Security Alert:</strong> {metrics.threatAlerts} active threat(s) detected. 
          Review the Threat Analytics section for details.
        </div>
      )}

      {/* Connection Test */}
      <ConnectionTest />

      {/* Network Status */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🌐 Network Status</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Consortium Blockchain:</strong>
            <span className="status-indicator status-operational">Connected</span>
          </div>
          <div>
            <strong>IPFS Network:</strong>
            <span className="status-indicator status-operational">Active</span>
          </div>
          <div>
            <strong>AI Oracle:</strong>
            <span className="status-indicator status-operational">Running</span>
          </div>
          <div>
            <strong>Public Anchoring:</strong>
            <span className="status-indicator status-operational">Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
