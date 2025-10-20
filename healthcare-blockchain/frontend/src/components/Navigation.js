import React from 'react';

const Navigation = ({ currentView, setCurrentView }) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'System overview and metrics'
    },
    {
      id: 'records',
      label: 'Intelligence Records',
      icon: '📁',
      description: 'Manage defense intelligence data'
    },
    {
      id: 'threats',
      label: 'Threat Analytics',
      icon: '🛡️',
      description: 'AI-powered threat detection'
    },
    {
      id: 'governance',
      label: 'Governance',
      icon: '🏛️',
      description: 'DAO voting and access control'
    },
    {
      id: 'anchoring',
      label: 'Global Anchoring',
      icon: '🌍',
      description: 'Public blockchain integration'
    }
  ];

  return (
    <nav className="navigation">
      <div className="nav-container">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => setCurrentView(item.id)}
            title={item.description}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
