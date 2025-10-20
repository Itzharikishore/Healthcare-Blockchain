import React, { useState, useEffect } from 'react';

const IntelligenceRecords = ({ contracts, account }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    dataType: 'satellite',
    classification: 'confidential',
    description: '',
    file: null
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // Simulate fetching records from smart contract
      const mockRecords = generateMockRecords();
      setRecords(mockRecords);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockRecords = () => {
    const dataTypes = ['satellite', 'field_report', 'analysis', 'threat_assessment'];
    const classifications = ['confidential', 'secret', 'top_secret'];
    const statuses = ['verified', 'pending', 'processing'];

    return Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      submitter: `0x${Math.random().toString(16).substr(2, 40)}`,
      dataType: dataTypes[Math.floor(Math.random() * dataTypes.length)],
      classification: classifications[Math.floor(Math.random() * classifications.length)],
      description: `Intelligence report ${i + 1}`,
      ipfsHash: `Qm${Math.random().toString(36).substr(2, 44)}`,
      zkpProofHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      isVerified: Math.random() > 0.3,
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    }));
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('dataType', uploadForm.dataType);
      formData.append('classification', uploadForm.classification);
      formData.append('metadata', JSON.stringify({
        description: uploadForm.description,
        submitter: account
      }));

      const response = await fetch('/api/upload-intelligence', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Intelligence record submitted successfully!');
        setShowUploadModal(false);
        setUploadForm({
          dataType: 'satellite',
          classification: 'confidential',
          description: '',
          file: null
        });
        fetchRecords();
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    }
  };

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'confidential': return 'status-warning';
      case 'secret': return 'status-critical';
      case 'top_secret': return 'status-critical';
      default: return 'status-operational';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'status-operational';
      case 'pending': return 'status-warning';
      case 'processing': return 'status-warning';
      default: return 'status-operational';
    }
  };

  const getDataTypeIcon = (dataType) => {
    switch (dataType) {
      case 'satellite': return '🛰️';
      case 'field_report': return '📋';
      case 'analysis': return '📊';
      case 'threat_assessment': return '⚠️';
      default: return '📄';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center">
          <div className="loading"></div>
          <p className="mt-2">Loading intelligence records...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>📁 Intelligence Records</h2>
          <p className="text-muted">Manage defense intelligence data with ZKP verification</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowUploadModal(true)}
        >
          📤 Submit New Record
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
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
          <div className="card" style={{ width: '500px', maxWidth: '90vw' }}>
            <div className="card-header">
              <h3 className="card-title">📤 Submit Intelligence Record</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'none', border: 'none', color: '#b8c5d1', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleFileUpload}>
              <div className="form-group">
                <label className="form-label">Data Type</label>
                <select 
                  className="form-select"
                  value={uploadForm.dataType}
                  onChange={(e) => setUploadForm({...uploadForm, dataType: e.target.value})}
                >
                  <option value="satellite">🛰️ Satellite Imagery</option>
                  <option value="field_report">📋 Field Report</option>
                  <option value="analysis">📊 Intelligence Analysis</option>
                  <option value="threat_assessment">⚠️ Threat Assessment</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Classification Level</label>
                <select 
                  className="form-select"
                  value={uploadForm.classification}
                  onChange={(e) => setUploadForm({...uploadForm, classification: e.target.value})}
                >
                  <option value="confidential">🟡 Confidential</option>
                  <option value="secret">🟠 Secret</option>
                  <option value="top_secret">🔴 Top Secret</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input"
                  rows="3"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="Brief description of the intelligence data..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">File</label>
                <input 
                  type="file"
                  className="form-input"
                  onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={!uploadForm.file}
                >
                  Submit Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📋 Intelligence Records ({records.length})</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select className="form-select" style={{ width: 'auto' }}>
              <option>All Types</option>
              <option>Satellite</option>
              <option>Field Report</option>
              <option>Analysis</option>
              <option>Threat Assessment</option>
            </select>
            <select className="form-select" style={{ width: 'auto' }}>
              <option>All Classifications</option>
              <option>Confidential</option>
              <option>Secret</option>
              <option>Top Secret</option>
            </select>
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Classification</th>
                <th>Description</th>
                <th>Submitter</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>#{record.id}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getDataTypeIcon(record.dataType)}
                      {record.dataType.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-indicator ${getClassificationColor(record.classification)}`}>
                      {record.classification.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>{record.description}</td>
                  <td>
                    <code style={{ fontSize: '0.8rem' }}>
                      {record.submitter.slice(0, 6)}...{record.submitter.slice(-4)}
                    </code>
                  </td>
                  <td>
                    <span className={`status-indicator ${getStatusColor(record.status)}`}>
                      {record.isVerified ? '✅ Verified' : '⏳ Pending'}
                    </span>
                  </td>
                  <td>{record.timestamp.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                        View
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ZKP Verification Status */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🔐 Zero-Knowledge Proof Verification</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Verified Records:</strong>
            <span className="status-indicator status-operational">
              {records.filter(r => r.isVerified).length}
            </span>
          </div>
          <div>
            <strong>Pending Verification:</strong>
            <span className="status-indicator status-warning">
              {records.filter(r => !r.isVerified).length}
            </span>
          </div>
          <div>
            <strong>ZKP Success Rate:</strong>
            <span className="status-indicator status-operational">
              {Math.round((records.filter(r => r.isVerified).length / records.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceRecords;
