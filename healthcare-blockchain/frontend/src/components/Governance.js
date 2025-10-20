import React, { useState, useEffect } from 'react';

const Governance = ({ contracts, account }) => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    proposalType: '1'
  });
  const [memberInfo, setMemberInfo] = useState(null);

  useEffect(() => {
    fetchProposals();
    fetchMemberInfo();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      // Simulate fetching proposals from smart contract
      const mockProposals = generateMockProposals();
      setProposals(mockProposals);
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberInfo = async () => {
    // Simulate fetching member information
    setMemberInfo({
      address: account,
      nationCode: 'USA',
      role: 'Intelligence Officer',
      votingPower: 100,
      isActive: true,
      isEmergencyMember: true
    });
  };

  const generateMockProposals = () => {
    const proposalTypes = [
      { id: 1, name: 'Add Member', description: 'Add new coalition member' },
      { id: 2, name: 'Remove Member', description: 'Remove coalition member' },
      { id: 3, name: 'Change Access Rules', description: 'Modify access control rules' },
      { id: 4, name: 'Emergency Action', description: 'Emergency security measures' }
    ];

    const statuses = ['active', 'passed', 'rejected', 'executed'];
    
    return Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      proposer: `0x${Math.random().toString(16).substr(2, 40)}`,
      title: `Proposal ${i + 1}: ${proposalTypes[Math.floor(Math.random() * proposalTypes.length)].name}`,
      description: `This proposal aims to ${proposalTypes[Math.floor(Math.random() * proposalTypes.length)].description.toLowerCase()}.`,
      proposalType: Math.floor(Math.random() * 4) + 1,
      votesFor: Math.floor(Math.random() * 100),
      votesAgainst: Math.floor(Math.random() * 100),
      startTime: new Date(Date.now() - Math.random() * 86400000 * 7),
      endTime: new Date(Date.now() + Math.random() * 86400000 * 3),
      executed: Math.random() > 0.7,
      passed: Math.random() > 0.5,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      hasVoted: Math.random() > 0.5
    }));
  };

  const createProposal = async () => {
    try {
      // Simulate creating proposal
      const proposal = {
        id: proposals.length + 1,
        proposer: account,
        title: newProposal.title,
        description: newProposal.description,
        proposalType: parseInt(newProposal.proposalType),
        votesFor: 0,
        votesAgainst: 0,
        startTime: new Date(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        executed: false,
        passed: false,
        status: 'active',
        hasVoted: false
      };

      setProposals([proposal, ...proposals]);
      setShowCreateModal(false);
      setNewProposal({ title: '', description: '', proposalType: '1' });
      
      alert('Proposal created successfully!');
    } catch (error) {
      console.error('Failed to create proposal:', error);
      alert('Failed to create proposal');
    }
  };

  const voteOnProposal = async (proposalId, support) => {
    try {
      // Simulate voting
      const updatedProposals = proposals.map(proposal => {
        if (proposal.id === proposalId) {
          return {
            ...proposal,
            hasVoted: true,
            votesFor: support ? proposal.votesFor + memberInfo.votingPower : proposal.votesFor,
            votesAgainst: !support ? proposal.votesAgainst + memberInfo.votingPower : proposal.votesAgainst
          };
        }
        return proposal;
      });

      setProposals(updatedProposals);
      alert(`Vote ${support ? 'for' : 'against'} proposal recorded!`);
    } catch (error) {
      console.error('Failed to vote:', error);
      alert('Failed to vote on proposal');
    }
  };

  const executeProposal = async (proposalId) => {
    try {
      // Simulate executing proposal
      const updatedProposals = proposals.map(proposal => {
        if (proposal.id === proposalId) {
          return {
            ...proposal,
            executed: true,
            status: 'executed'
          };
        }
        return proposal;
      });

      setProposals(updatedProposals);
      alert('Proposal executed successfully!');
    } catch (error) {
      console.error('Failed to execute proposal:', error);
      alert('Failed to execute proposal');
    }
  };

  const getProposalTypeName = (type) => {
    const types = {
      1: 'Add Member',
      2: 'Remove Member',
      3: 'Change Access Rules',
      4: 'Emergency Action'
    };
    return types[type] || 'Unknown';
  };

  const getProposalTypeColor = (type) => {
    const colors = {
      1: 'status-operational',
      2: 'status-warning',
      3: 'status-warning',
      4: 'status-critical'
    };
    return colors[type] || 'status-operational';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-warning';
      case 'passed': return 'status-operational';
      case 'rejected': return 'status-critical';
      case 'executed': return 'status-operational';
      default: return 'status-operational';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '⏳ Active';
      case 'passed': return '✅ Passed';
      case 'rejected': return '❌ Rejected';
      case 'executed': return '✅ Executed';
      default: return '⚪ Unknown';
    }
  };

  const isVotingPeriod = (endTime) => {
    return new Date(endTime) > new Date();
  };

  if (loading) {
    return (
      <div className="card">
        <div className="text-center">
          <div className="loading"></div>
          <p className="mt-2">Loading governance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>🏛️ Governance</h2>
          <p className="text-muted">Decentralized Autonomous Organization for coalition governance</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          📝 Create Proposal
        </button>
      </div>

      {/* Member Info */}
      {memberInfo && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">👤 Your Governance Status</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <strong>Nation:</strong>
              <br />
              <span className="status-indicator status-operational">{memberInfo.nationCode}</span>
            </div>
            <div>
              <strong>Role:</strong>
              <br />
              {memberInfo.role}
            </div>
            <div>
              <strong>Voting Power:</strong>
              <br />
              <span className="status-indicator status-operational">{memberInfo.votingPower} votes</span>
            </div>
            <div>
              <strong>Emergency Member:</strong>
              <br />
              <span className={`status-indicator ${memberInfo.isEmergencyMember ? 'status-operational' : 'status-warning'}`}>
                {memberInfo.isEmergencyMember ? '✅ Yes' : '❌ No'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Governance Stats */}
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Active Proposals</h3>
          </div>
          <div className="card-value">{proposals.filter(p => p.status === 'active').length}</div>
          <div className="card-description">Currently under voting</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">✅ Passed Proposals</h3>
          </div>
          <div className="card-value">{proposals.filter(p => p.status === 'passed').length}</div>
          <div className="card-description">Successfully passed</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚡ Emergency Actions</h3>
          </div>
          <div className="card-value">{proposals.filter(p => p.proposalType === 4).length}</div>
          <div className="card-description">Emergency proposals</div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">👥 Total Members</h3>
          </div>
          <div className="card-value">24</div>
          <div className="card-description">Active coalition members</div>
        </div>
      </div>

      {/* Create Proposal Modal */}
      {showCreateModal && (
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
              <h3 className="card-title">📝 Create New Proposal</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: '#b8c5d1', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createProposal(); }}>
              <div className="form-group">
                <label className="form-label">Proposal Type</label>
                <select 
                  className="form-select"
                  value={newProposal.proposalType}
                  onChange={(e) => setNewProposal({...newProposal, proposalType: e.target.value})}
                >
                  <option value="1">Add Member</option>
                  <option value="2">Remove Member</option>
                  <option value="3">Change Access Rules</option>
                  <option value="4">Emergency Action</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Title</label>
                <input 
                  type="text"
                  className="form-input"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal({...newProposal, title: e.target.value})}
                  placeholder="Brief title for the proposal"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input"
                  rows="4"
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({...newProposal, description: e.target.value})}
                  placeholder="Detailed description of the proposal..."
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proposals Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📋 Governance Proposals</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select className="form-select" style={{ width: 'auto' }}>
              <option>All Types</option>
              <option>Add Member</option>
              <option>Remove Member</option>
              <option>Change Access Rules</option>
              <option>Emergency Action</option>
            </select>
            <select className="form-select" style={{ width: 'auto' }}>
              <option>All Status</option>
              <option>Active</option>
              <option>Passed</option>
              <option>Rejected</option>
              <option>Executed</option>
            </select>
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Title</th>
                <th>Proposer</th>
                <th>Votes For</th>
                <th>Votes Against</th>
                <th>Status</th>
                <th>End Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr key={proposal.id}>
                  <td>#{proposal.id}</td>
                  <td>
                    <span className={`status-indicator ${getProposalTypeColor(proposal.proposalType)}`}>
                      {getProposalTypeName(proposal.proposalType)}
                    </span>
                  </td>
                  <td>
                    <div>
                      <strong>{proposal.title}</strong>
                      <br />
                      <small style={{ color: '#b8c5d1' }}>{proposal.description.slice(0, 50)}...</small>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.8rem' }}>
                      {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
                    </code>
                  </td>
                  <td>{proposal.votesFor}</td>
                  <td>{proposal.votesAgainst}</td>
                  <td>
                    <span className={`status-indicator ${getStatusColor(proposal.status)}`}>
                      {getStatusText(proposal.status)}
                    </span>
                  </td>
                  <td>{proposal.endTime.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {proposal.status === 'active' && isVotingPeriod(proposal.endTime) && !proposal.hasVoted && (
                        <>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                            onClick={() => voteOnProposal(proposal.id, true)}
                          >
                            Vote For
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                            onClick={() => voteOnProposal(proposal.id, false)}
                          >
                            Vote Against
                          </button>
                        </>
                      )}
                      {proposal.status === 'passed' && !proposal.executed && (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          onClick={() => executeProposal(proposal.id)}
                        >
                          Execute
                        </button>
                      )}
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                      >
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

      {/* Voting Guidelines */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📖 Voting Guidelines</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Regular Proposals:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>3-day voting period</li>
              <li>30% quorum required</li>
              <li>51% majority to pass</li>
            </ul>
          </div>
          <div>
            <strong>Emergency Proposals:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>1-hour voting period</li>
              <li>Emergency members only</li>
              <li>75% majority required</li>
            </ul>
          </div>
          <div>
            <strong>Your Voting Power:</strong>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>{memberInfo?.votingPower || 0} votes per proposal</li>
              <li>One vote per proposal</li>
              <li>Cannot change vote once cast</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Governance;
