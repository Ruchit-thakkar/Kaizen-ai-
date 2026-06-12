import React, { useState, useEffect } from 'react';
import { Menu, PanelLeftOpen, Sparkles, Wifi, WifiOff, AlertCircle, X, ChevronDown, Check } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import ChatContainer from '../../components/ChatContainer/ChatContainer';
import MessageInput from '../../components/MessageInput/MessageInput';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../context/AuthContext';

const AVAILABLE_MODELS = [
  {
    id: "deepseekFlash",
    name: "DeepSeek Flash",
    provider: "DeepSeek",
    modelString: "deepseek-v4-flash",
    description: "Fast responses, low latency, agent & tool calling",
    suggestedUsage: "Fast chats, agents, everyday questions",
    color: "bg-blue-500",
    textBg: "text-blue-400 bg-blue-500/10 border-blue-500/20"
  },
  {
    id: "deepseekPro",
    name: "DeepSeek Pro",
    provider: "DeepSeek",
    modelString: "deepseek-v4-pro",
    description: "Programming, advanced reasoning, and complex logic",
    suggestedUsage: "Coding, complex reasoning",
    color: "bg-cyan-500",
    textBg: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
  },
  {
    id: "llama70b",
    name: "Llama 3.3 70B",
    provider: "Meta",
    modelString: "llama-3.3-70b-instruct",
    description: "General-purpose conversation, long answers, creativity",
    suggestedUsage: "General-purpose tasks",
    color: "bg-purple-500",
    textBg: "text-purple-400 bg-purple-500/10 border-purple-500/20"
  },
  {
    id: "gemma31b",
    name: "Gemma 4 31B",
    provider: "Google",
    modelString: "gemma-4-31b-it",
    description: "Balanced performance for everyday tasks",
    suggestedUsage: "Balanced performance",
    color: "bg-amber-500",
    textBg: "text-amber-400 bg-amber-500/10 border-amber-500/20"
  },
  {
    id: "phi4Mini",
    name: "Phi 4 Mini",
    provider: "Microsoft",
    modelString: "phi-4-mini-instruct",
    description: "Lightweight tasks, fast responses, and cheap inference",
    suggestedUsage: "Lightweight tasks, cheap inference",
    color: "bg-emerald-500",
    textBg: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
  },
  {
    id: "gptOss120b",
    name: "GPT OSS 120B",
    provider: "OpenAI",
    modelString: "gpt-oss-120b",
    description: "High-quality reasoning, general intelligence, complex conversations",
    suggestedUsage: "Premium reasoning",
    color: "bg-rose-500",
    textBg: "text-rose-400 bg-rose-500/10 border-rose-500/20"
  }
];

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout } = useAuth();

  const {
    messages,
    conversations,
    activeConversationId,
    isGenerating,
    isConnected,
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

  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  // Watch for errors and display them as toast notifications
  useEffect(() => {
    if (error) {
      setToastMessage(error);
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle mobile screen size sidebar auto-collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    // Call handler on mount to set initial size
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-900 text-zinc-100 font-sans">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-slide-in flex items-center gap-3 px-4 py-3.5 bg-zinc-950 border border-red-500/30 rounded-2xl shadow-xl max-w-md">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-red-400 font-mono uppercase">System Error</span>
            <span className="text-xs text-zinc-300 font-medium">{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors ml-auto"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Collapsible Sidebar */}
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
      />

      {/* Main chat workspace */}
      <div className="flex-1 flex flex-col relative h-full min-w-0 bg-[#0e1015]">
        
        {/* Workspace Header */}
        <header className="flex items-center justify-between px-4 border-b border-zinc-900/60 bg-zinc-950/20 backdrop-blur-md h-16 shrink-0 z-30">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle button (only visible when sidebar is collapsed) */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-all duration-150"
                title="Open sidebar"
              >
                <PanelLeftOpen className="h-5 w-5" />
              </button>
            )}
            
            {/* Mini Brand details (shown on mobile when sidebar is closed) */}
            {!sidebarOpen && (
              <div className="flex items-center gap-2 md:hidden">
                <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                <span className="font-semibold text-sm tracking-wider text-zinc-200">Kaizen AI</span>
              </div>
            )}

            {/* Model Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-850 cursor-pointer transition-all duration-200 text-xs text-zinc-300 select-none shadow-sm hover:border-zinc-700 active:scale-98"
                title="Switch AI model"
              >
                <span className={`h-2 w-2 rounded-full ${AVAILABLE_MODELS.find(m => m.id === activeModel)?.color || 'bg-blue-500'} shadow`} />
                <span className="font-semibold text-zinc-200">{AVAILABLE_MODELS.find(m => m.id === activeModel)?.name || 'DeepSeek Flash'}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${modelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {modelDropdownOpen && (
                <>
                  {/* Backdrop for click-away */}
                  <div className="fixed inset-0 z-40" onClick={() => setModelDropdownOpen(false)} />
                  
                  {/* Dropdown Card */}
                  <div className="absolute left-0 mt-2 w-76 bg-zinc-950/95 border border-zinc-850/80 rounded-2xl shadow-2xl backdrop-blur-xl p-1.5 z-50 animate-slide-in flex flex-col gap-0.5">
                    <div className="px-3 py-2 border-b border-zinc-900/60 flex flex-col mb-1 select-none">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">Select AI Model</span>
                      <span className="text-[11px] text-zinc-400 mt-0.5 font-light">Choose the engine for this conversation.</span>
                    </div>
                    <div className="max-h-76 overflow-y-auto flex flex-col gap-1 pr-0.5 scrollbar-thin scrollbar-thumb-zinc-800">
                      {AVAILABLE_MODELS.map((m) => {
                        const isSelected = m.id === activeModel;
                        return (
                          <button
                            key={m.id}
                            onClick={() => {
                              changeConversationModel(activeConversationId, m.id);
                              setModelDropdownOpen(false);
                            }}
                            className={`flex flex-col text-left px-3 py-2 rounded-xl transition-all duration-150 select-none ${
                              isSelected 
                                ? 'bg-indigo-650/10 border border-indigo-500/20' 
                                : 'hover:bg-zinc-900/60 border border-transparent hover:border-zinc-850'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 w-full">
                              <span className={`h-1.5 w-1.5 rounded-full ${m.color}`} />
                              <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-300' : 'text-zinc-200'}`}>
                                {m.name}
                              </span>
                              <span className={`text-[8px] font-bold font-mono uppercase px-1 rounded border ml-auto shrink-0 select-none ${m.textBg}`}>
                                {m.provider}
                              </span>
                              {isSelected && <Check className="h-3 w-3 text-indigo-400 shrink-0 ml-1" />}
                            </div>
                            <span className="text-[10px] text-zinc-450 font-light mt-1 leading-normal">
                              {m.description}
                            </span>
                            <span className="text-[8px] text-zinc-500 font-mono mt-0.5 select-none font-medium">
                              Usage: {m.suggestedUsage}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
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
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#0e1015] via-[#0e1015]/95 to-transparent pt-10 pb-6 shrink-0 z-20">
          <MessageInput 
            onSendMessage={sendMessage} 
            isGenerating={isGenerating} 
            onStopGeneration={stopGeneration}
          />
          <div className="text-center text-[10px] text-zinc-600 mt-2 tracking-wide font-mono">
            Kaizen AI MVP v1.0.0. Gemini API response speeds may vary.
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal Overlay */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-850 p-6 rounded-3xl max-w-sm w-full mx-4 shadow-2xl animate-slide-in">
            <h3 className="text-lg font-bold font-outfit text-white">Sign out</h3>
            <p className="text-zinc-400 text-sm mt-2 font-light">Are you sure you want to end your session?</p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-350 text-sm font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all shadow-md shadow-red-650/10 hover:scale-[1.02] active:scale-95"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
