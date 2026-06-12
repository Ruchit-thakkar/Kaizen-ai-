import React, { useState } from 'react';
import { Plus, MessageSquare, Sparkles, PanelLeftClose, Trash2, Edit2, Check, X, LogOut } from 'lucide-react';

export default function Sidebar({
  isOpen,
  toggleSidebar,
  onNewChat,
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  user,
  onLogout
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const startEditing = (chat, e) => {
    e.stopPropagation();
    setEditingId(chat._id);
    setEditTitle(chat.title);
    setDeleteConfirmId(null);
  };

  const handleRename = (id, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <div 
      className={`fixed md:relative top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out flex flex-col bg-zinc-950 border-r border-zinc-800 text-zinc-200
        ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:-translate-x-full md:hidden'}
      `}
    >
      {/* Header with Logo and Collapse button */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-850 h-16">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-4 w-4 text-white animate-pulse" />
          </div>
          <span className="font-semibold text-lg tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Kaizen AI
          </span>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Close sidebar"
        >
          <PanelLeftClose className="h-5 w-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-3 py-3 border border-zinc-800 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-white hover:border-zinc-700 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.01]"
        >
          <Plus className="h-5 w-5 text-indigo-400" />
          <span className="text-sm font-medium">New chat</span>
        </button>
      </div>

      {/* Dynamic Chats list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin">
        <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          Recent Chats
        </div>
        
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-650 italic">
            No recent chats
          </div>
        ) : (
          conversations.map((chat) => {
            const isActive = chat._id === activeConversationId;
            
            // Delete confirmation state
            if (deleteConfirmId === chat._id) {
              return (
                <div 
                  key={chat._id}
                  className="flex items-center justify-between w-full px-3 py-2.5 bg-red-950/20 border border-red-900/30 rounded-xl animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs text-red-300 font-medium truncate">Delete this chat?</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteConversation(chat._id); setDeleteConfirmId(null); }}
                      className="p-1.5 bg-red-900/40 hover:bg-red-900/60 rounded text-red-200 transition-colors"
                      title="Confirm Delete"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                      className="p-1.5 bg-zinc-850 hover:bg-zinc-800 rounded text-zinc-300 transition-colors"
                      title="Cancel"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            }

            // Normal or editing state
            return (
              <div
                key={chat._id}
                onClick={() => onSelectConversation(chat._id)}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150
                  ${isActive 
                    ? 'bg-zinc-900/90 border border-zinc-850 text-white font-medium' 
                    : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                  }
                `}
              >
                <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                
                {editingId === chat._id ? (
                  <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(chat._id, e);
                        if (e.key === 'Escape') cancelEditing(e);
                      }}
                      className="flex-1 bg-zinc-900 text-white text-xs px-2 py-1 rounded border border-zinc-700 focus:outline-none focus:border-indigo-500 w-full"
                      autoFocus
                    />
                    <button 
                      onClick={(e) => handleRename(chat._id, e)}
                      className="p-0.5 hover:bg-zinc-800 rounded text-green-400 hover:text-green-300"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={cancelEditing}
                      className="p-0.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-300"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm truncate pr-10">{chat.title}</span>
                    
                    {/* Actions visible on hover / active */}
                    <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity duration-150">
                      <button 
                        onClick={(e) => startEditing(chat, e)} 
                        className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
                        title="Rename Chat"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(chat._id); setEditingId(null); }} 
                        className="p-1 hover:bg-zinc-850 rounded text-zinc-400 hover:text-red-400 transition-colors"
                        title="Delete Chat"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-650 flex items-center justify-center text-white font-semibold text-sm shadow-md shrink-0 uppercase">
            {user ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-zinc-200 truncate">{user?.name || 'Kaizen User'}</span>
            <span className="text-[10px] text-zinc-500 truncate">{user?.email || 'Authenticated'}</span>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-red-400 transition-colors shrink-0"
          title="Log out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
