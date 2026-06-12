import React, { useState, useEffect } from 'react';
import { Menu, AlertCircle, X, Settings } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import ChatContainer from '../../components/ChatContainer/ChatContainer';
import MessageInput from '../../components/MessageInput/MessageInput';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user, logout } = useAuth();

  const {
    messages,
    conversations,
    activeConversationId,
    isGenerating,
    error,
    sendMessage,
    stopGeneration,
    regenerateResponse,
    clearChat,
    selectConversation,
    renameConversation,
    deleteConversation,
    activeModel,
    changeConversationModel
  } = useSocket();

  // Watch for errors and display them as toast notifications
  useEffect(() => {
    if (error) {
      setToastMessage(error);
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Escape key closes sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-main-bg text-white font-sans relative">
      
      {/* Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in lg:hidden"
        />
      )}

      {/* Collapsible Overlay Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(false)} 
        onNewChat={clearChat}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
        user={user}
        onLogout={() => setShowLogoutModal(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-slide-in flex items-center gap-3 px-4 py-3.5 bg-input-bg border border-border-color rounded-2xl shadow-xl max-w-md">
          <AlertCircle className="h-5 w-5 text-white shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-white font-mono uppercase">System Error</span>
            <span className="text-xs text-secondary-text font-medium font-outfit">{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-elevated-card rounded-lg text-muted-text hover:text-white transition-colors ml-auto cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main chat workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-chat-bg overflow-hidden relative">
        
        {/* Workspace Header - Displays Hamburger and Logo */}
        <header className="flex items-center justify-between px-4 bg-chat-bg h-16 shrink-0 z-30 select-none border-b border-border-color/20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 rounded-lg hover:bg-input-bg text-secondary-text hover:text-white transition-colors cursor-pointer focus:outline-none"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu className="h-5.5 w-5.5" />
            </button>
            <div className="flex items-center gap-2.5">
              <img 
                src="https://ik.imagekit.io/devnext/kaizen%20ai%20logo" 
                alt="Kaizen AI Logo" 
                className="h-7 w-7 object-contain" 
              />
              <span className="font-extrabold text-base tracking-wider text-white font-outfit">
                Kaizen AI
              </span>
            </div>
          </div>
        </header>

        {/* Message stream area */}
        <ChatContainer 
          messages={messages} 
          isGenerating={isGenerating} 
          onSendMessage={sendMessage}
          onRegenerate={regenerateResponse}
        />

        {/* Floating/sticky input area */}
        <div className="w-full bg-chat-bg pt-4 pb-6 shrink-0 z-20 border-t border-border-color/10">
          <MessageInput 
            onSendMessage={sendMessage} 
            isGenerating={isGenerating} 
            onStopGeneration={stopGeneration}
            activeModel={activeModel}
            changeConversationModel={changeConversationModel}
            activeConversationId={activeConversationId}
          />
          <div className="text-center text-[10px] text-muted-text mt-2.5 tracking-wide font-mono select-none">
            Kaizen AI v1.0.0. Grayscale Minimalist Layout.
          </div>
        </div>
      </div>

      {/* Settings Modal Component */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-elevated-card border border-border-color p-6 rounded-3xl max-w-md w-full mx-4 shadow-2xl animate-slide-in text-white relative">
            <button 
              onClick={() => setSettingsOpen(false)}
              className="absolute top-4.5 right-4.5 p-1 rounded-lg hover:bg-input-bg text-secondary-text hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
            
            <h3 className="text-lg font-bold font-outfit text-white mb-1.5 flex items-center gap-2">
              Settings
            </h3>
            
            <p className="text-secondary-text text-xs font-light mb-6 border-b border-border-color/60 pb-3 font-outfit">
              Manage your preferences and view system diagnostic information.
            </p>

            <div className="space-y-4">
              {/* User Profile Info Card */}
              <div className="p-4 rounded-2xl bg-input-bg border border-border-color">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider font-mono mb-2">User Profile</h4>
                <div className="space-y-2 text-sm font-outfit">
                  <div className="flex justify-between">
                    <span className="text-secondary-text font-light">Name:</span>
                    <span className="font-semibold text-white">{user?.name || 'Kaizen User'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-text font-light">Email:</span>
                    <span className="font-mono text-xs text-white">{user?.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Preferences Card */}
              <div className="p-4 rounded-2xl bg-input-bg border border-border-color">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider font-mono mb-2">Engine Settings</h4>
                <div className="space-y-2 text-sm font-outfit">
                  <div className="flex justify-between">
                    <span className="text-secondary-text font-light">API Connection:</span>
                    <span className="flex items-center gap-1.5 text-white font-semibold text-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      Connected (Socket.IO)
                    </span>
                  </div>
                </div>
              </div>

              {/* Version Specs */}
              <div className="flex justify-between items-center text-[10px] text-muted-text pt-2 font-mono px-1">
                <span>Kaizen System Version</span>
                <span>v1.0.0 (Grayscale)</span>
              </div>
            </div>

            <div className="flex justify-end mt-6.5">
              <button
                onClick={() => setSettingsOpen(false)}
                className="px-5 py-2 rounded-xl bg-white hover:bg-secondary-text text-main-bg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer font-outfit"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal Overlay */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-elevated-card border border-border-color p-6 rounded-3xl max-w-sm w-full mx-4 shadow-2xl animate-slide-in">
            <h3 className="text-lg font-bold font-outfit text-white">Sign out?</h3>
            <p className="text-secondary-text text-sm mt-2 font-light font-outfit">Are you sure you want to log out of Kaizen AI?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl bg-input-bg border border-border-color hover:bg-elevated-card text-secondary-text hover:text-white text-xs font-semibold transition-all cursor-pointer font-outfit"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-secondary-text text-main-bg text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-95 font-outfit"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
