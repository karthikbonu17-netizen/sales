import React, { useState, useEffect } from 'react';
import { AgentType, ServerConfigStatus, AuthUser } from './types';
import { api } from './api';
import { Header } from './components/Header';
import { AgentNavigation } from './components/AgentNavigation';
import { ChatArea } from './components/ChatArea';
import { MemoryPanel } from './components/MemoryPanel';
import { DealsKanban } from './components/DealsKanban';
import { ProposalsView } from './components/ProposalsView';
import { DemoScenarioModal } from './components/DemoScenarioModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { LoginPage } from './components/LoginPage';

export const App: React.FC = () => {
  // Always open login page by default when website loads
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Ensure fresh session so user always lands on the login page by default
    localStorage.removeItem('salesmind_user');
    localStorage.removeItem('salesmind_token');
  }, []);

  const [currentView, setCurrentView] = useState<'chat' | 'kanban' | 'proposals'>('chat');
  const [activeAgent, setActiveAgent] = useState<AgentType>('recorder');
  const [isMemoryPanelOpen, setIsMemoryPanelOpen] = useState(true);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [configStatus, setConfigStatus] = useState<ServerConfigStatus | null>(null);
  const [memoryStats, setMemoryStats] = useState<Record<AgentType, number>>({
    recorder: 0,
    analyst: 0,
    planner: 0,
  });

  const refreshData = async () => {
    try {
      const statsRes = await api.getMemoryStats();
      if (statsRes.stats) {
        setMemoryStats(statsRes.stats);
      }
      const configRes = await api.getConfigStatus();
      setConfigStatus(configRes);
    } catch (err) {
      console.error('Error refreshing state:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('salesmind_user');
    localStorage.removeItem('salesmind_token');
    setCurrentUser(null);
  };

  // If not authenticated, render pixel-perfect responsive LoginPage
  if (!currentUser) {
    return (
      <LoginPage 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }} 
      />
    );
  }

  return (
    <div className="app-container">
      {/* Top Enterprise Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenDemo={() => setIsDemoModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        configStatus={configStatus}
        toggleMemoryPanel={() => setIsMemoryPanelOpen(!isMemoryPanelOpen)}
        isMemoryPanelOpen={isMemoryPanelOpen}
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Body */}
      <div className="main-body">
        {currentView === 'chat' && (
          <>
            {/* Left 3-Agent Navigation Column */}
            <AgentNavigation
              activeAgent={activeAgent}
              setActiveAgent={setActiveAgent}
              memoryStats={memoryStats}
            />

            {/* Center Dedicated Agent Chat Workspace */}
            <ChatArea
              activeAgent={activeAgent}
              onStateChange={refreshData}
            />

            {/* Right Collapsible Hindsight Memory & Context Panel */}
            <MemoryPanel
              isOpen={isMemoryPanelOpen}
              onClose={() => setIsMemoryPanelOpen(false)}
              activeAgent={activeAgent}
              onMemoryChange={refreshData}
            />
          </>
        )}

        {currentView === 'kanban' && <DealsKanban />}

        {currentView === 'proposals' && <ProposalsView />}
      </div>

      {/* Modals */}
      <DemoScenarioModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectAgent={(agent) => {
          setActiveAgent(agent);
          setCurrentView('chat');
        }}
        onRefreshData={refreshData}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        configStatus={configStatus}
      />
    </div>
  );
};

export default App;
