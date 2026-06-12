import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Search, 
  Settings,
  MoreHorizontal,
  Check,
  LogOut
} from 'lucide-react';

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
  onLogout,
  onOpenSettings
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  
  // Manage pinned chats via localStorage per user
  const [pinnedIds, setPinnedIds] = useState(() => {
    try {
      const userId = user?._id || 'guest';
      const saved = localStorage.getItem(`pinned_chats_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep pinned lists synchronized if user switches
  useEffect(() => {
    try {
      const userId = user?._id || 'guest';
      const saved = localStorage.getItem(`pinned_chats_${userId}`);
      setPinnedIds(saved ? JSON.parse(saved) : []);
    } catch {
      setPinnedIds([]);
    }
  }, [user]);

  const togglePin = (chatId, e) => {
    if (e) e.stopPropagation();
    setPinnedIds(prev => {
      const next = prev.includes(chatId) ? prev.filter(id => id !== chatId) : [...prev, chatId];
      const userId = user?._id || 'guest';
      localStorage.setItem(`pinned_chats_${userId}`, JSON.stringify(next));
      return next;
    });
  };

  // Close menu and delete states when sidebar collapses
  useEffect(() => {
    if (!isOpen) {
      setActiveMenuId(null);
      setDeleteConfirmId(null);
      setEditingId(null);
    }
  }, [isOpen]);

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

  // Date Grouping Helper
  const groupConversations = (chats) => {
    const today = [];
    const yesterday = [];
    const last7Days = [];
    const last30Days = [];
    const older = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const startOf7DaysAgo = startOfToday - 6 * 24 * 60 * 60 * 1000;
    const startOf30DaysAgo = startOfToday - 29 * 24 * 60 * 60 * 1000;

    chats.forEach(chat => {
      const chatTime = new Date(chat.updatedAt || chat.createdAt || now).getTime();
      if (chatTime >= startOfToday) {
        today.push(chat);
      } else if (chatTime >= startOfYesterday) {
        yesterday.push(chat);
      } else if (chatTime >= startOf7DaysAgo) {
        last7Days.push(chat);
      } else if (chatTime >= startOf30DaysAgo) {
        last30Days.push(chat);
      } else {
        older.push(chat);
      }
    });

    return {
      "Today": today,
      "Yesterday": yesterday,
      "Previous 7 Days": last7Days,
      "Previous 30 Days": last30Days,
      "Older": older
    };
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredConversations.filter(c => pinnedIds.includes(c._id));
  const recentChats = filteredConversations.filter(c => !pinnedIds.includes(c._id));

  const groups = groupConversations(recentChats);

  return (
    <div 
      className={`fixed lg:static top-0 bottom-0 left-0 h-full z-50 transition-all duration-300 ease-in-out flex flex-col bg-sidebar-bg border-r border-border-color text-white select-none
        ${isOpen 
          ? 'w-[85vw] sm:w-[320px] lg:w-[300px] translate-x-0' 
          : '-translate-x-full lg:translate-x-0 lg:w-20'
        }
      `}
    >
      {/* Header with Logo and Close button */}
      <div className="flex items-center justify-between p-4.5 border-b border-border-color h-16 shrink-0 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <img 
            src="https://ik.imagekit.io/devnext/kaizen%20ai%20logo" 
            alt="Kaizen AI Logo" 
            className="h-8 w-8 object-contain shrink-0" 
          />
          {isOpen && (
            <span className="font-extrabold text-base font-outfit tracking-wider text-white truncate">
              KAIZEN AI
            </span>
          )}
        </div>
        {isOpen && (
          <button 
            onClick={toggleSidebar} 
            className="p-1.5 rounded-lg hover:bg-input-bg text-secondary-text hover:text-white transition-colors cursor-pointer lg:hidden"
            title="Close sidebar"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* Action Area: New Chat & Search */}
      <div className="p-4 shrink-0 flex flex-col items-center gap-3">
        {isOpen ? (
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) toggleSidebar();
            }}
            className="w-full flex items-center justify-center py-2.5 rounded-xl bg-white hover:bg-secondary-text text-main-bg font-extrabold text-sm transition-colors cursor-pointer"
          >
            New Chat
          </button>
        ) : (
          <button
            onClick={onNewChat}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white hover:bg-secondary-text text-main-bg transition-colors cursor-pointer"
            title="New Chat"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}

        {/* Search Bar - hidden when collapsed */}
        {isOpen && (
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3.5 h-4 w-4 text-muted-text" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-input-bg border border-border-color focus:border-white focus:outline-none rounded-xl py-2 pl-10 pr-3.5 text-xs text-white placeholder-muted-text transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-0.5 hover:bg-elevated-card rounded text-muted-text hover:text-white cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grouped History List - hidden when collapsed */}
      {isOpen ? (
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-5 scrollbar-thin">
          {/* Pinned Section */}
          {pinnedChats.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-muted-text uppercase tracking-widest font-mono select-none">
                Pinned
              </div>
              <div className="space-y-0.5">
                {pinnedChats.map(chat => renderChatItem(chat, true))}
              </div>
            </div>
          )}

          {/* Chronological groups */}
          {Object.entries(groups).map(([groupName, groupChats]) => {
            if (groupChats.length === 0) return null;

            return (
              <div key={groupName} className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold text-muted-text uppercase tracking-widest font-mono select-none">
                  {groupName}
                </div>
                <div className="space-y-0.5">
                  {groupChats.map(chat => renderChatItem(chat, false))}
                </div>
              </div>
            );
          })}

          {filteredConversations.length === 0 && (
            <div className="p-8 flex flex-col items-center justify-center gap-3 select-none text-center animate-fade-in">
              <img 
                src="https://ik.imagekit.io/devnext/kaizen%20ai%20logo" 
                alt="Kaizen AI Logo" 
                className="h-8 w-8 object-contain opacity-40" 
              />
              <span className="text-xs text-muted-text font-light font-outfit">
                {searchQuery ? 'No matching chats' : 'No conversations'}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Fills space when collapsed */
        <div className="flex-1" />
      )}

      {/* User profile footer */}
      {isOpen ? (
        <div className="p-4 border-t border-border-color bg-sidebar-bg flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8.5 w-8.5 rounded-full bg-elevated-card flex items-center justify-center text-white font-bold text-xs shrink-0 uppercase select-none font-outfit">
              {user ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
            </div>
            <div className="flex flex-col min-w-0 select-text">
              <span className="text-xs font-bold text-white truncate font-outfit">{user?.name || 'Kaizen User'}</span>
              <span className="text-[10px] text-muted-text truncate font-mono">{user?.email || 'Authenticated'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => {
                onOpenSettings();
                if (window.innerWidth < 1024) toggleSidebar();
              }}
              className="p-1.5 hover:bg-input-bg rounded-lg text-secondary-text hover:text-white transition-colors shrink-0 cursor-pointer"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button 
              onClick={onLogout}
              className="p-1.5 hover:bg-red-500/10 rounded-lg text-secondary-text hover:text-red-400 transition-colors shrink-0 cursor-pointer"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-border-color bg-sidebar-bg flex flex-col items-center gap-4 shrink-0">
          <div 
            className="h-8.5 w-8.5 rounded-full bg-elevated-card flex items-center justify-center text-white font-bold text-xs shrink-0 uppercase select-none font-outfit cursor-pointer"
            title={user?.name || 'Kaizen User'}
          >
            {user ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
          </div>
          <button 
            onClick={onOpenSettings}
            className="p-2 hover:bg-input-bg rounded-xl text-secondary-text hover:text-white transition-colors shrink-0 cursor-pointer"
            title="Settings"
          >
            <Settings className="h-4.5 w-4.5" />
          </button>
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-red-500/10 rounded-xl text-secondary-text hover:text-red-400 transition-colors shrink-0 cursor-pointer"
            title="Log out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      )}
    </div>
  );

  // Helper render for items to keep layout clean
  function renderChatItem(chat, isPinned) {
    const isActive = chat._id === activeConversationId;

    if (deleteConfirmId === chat._id) {
      return (
        <div 
          key={chat._id}
          className="flex items-center justify-between w-full px-2 py-2 bg-red-950/20 border border-red-900/35 rounded-lg animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs text-red-300 font-semibold truncate font-outfit">Delete chat?</span>
          <div className="flex items-center gap-1 shrink-0">
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteConversation(chat._id); setDeleteConfirmId(null); }}
              className="p-1 bg-red-900/40 hover:bg-red-900/60 rounded text-red-100 transition-colors cursor-pointer"
              title="Confirm Delete"
            >
              <Check className="h-3 w-3" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
              className="p-1 bg-input-bg hover:bg-elevated-card rounded text-secondary-text transition-colors cursor-pointer"
              title="Cancel"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={chat._id}
        onClick={() => {
          onSelectConversation(chat._id);
          toggleSidebar();
        }}
        className={`group relative flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer transition-all duration-150 border-l-2
          ${isActive 
            ? 'bg-elevated-card border-white text-white font-medium' 
            : 'border-transparent text-secondary-text hover:bg-input-bg hover:text-white'
          }
        `}
      >
        {editingId === chat._id ? (
          <div className="flex items-center gap-1.5 w-full animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(chat._id, e);
                if (e.key === 'Escape') cancelEditing(e);
              }}
              className="flex-1 bg-main-bg text-white text-xs px-2 py-1 rounded border border-border-color focus:outline-none focus:border-white w-full"
              autoFocus
            />
            <button 
              onClick={(e) => handleRename(chat._id, e)}
              className="p-0.5 hover:bg-input-bg rounded text-green-400 hover:text-green-300 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={cancelEditing}
              className="p-0.5 hover:bg-input-bg rounded text-secondary-text hover:text-white cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <>
            <span className="text-xs truncate pr-6 font-outfit select-none leading-relaxed">{chat.title}</span>
            
            {/* 3-dots Menu Button: Visible on hover on desktop, always visible on mobile */}
            <div className={`absolute right-1.5 flex items-center z-10 transition-opacity duration-150 
              ${activeMenuId === chat._id 
                ? 'opacity-100' 
                : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
              }`}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(activeMenuId === chat._id ? null : chat._id);
                }}
                className="p-1 hover:bg-elevated-card rounded text-secondary-text hover:text-white transition-colors cursor-pointer"
                title="Options"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Dropdown Options */}
            {activeMenuId === chat._id && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                <div className="absolute right-2 top-8 bg-elevated-card border border-border-color rounded-xl py-1 shadow-lg z-50 w-28 text-left animate-slide-in">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(chat, e);
                      setActiveMenuId(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-input-bg text-xs text-white transition-colors cursor-pointer font-outfit"
                  >
                    Rename
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(chat._id, e);
                      setActiveMenuId(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-input-bg text-xs text-white transition-colors cursor-pointer font-outfit"
                  >
                    {isPinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(chat._id);
                      setActiveMenuId(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-red-500/10 text-xs text-red-400 transition-colors cursor-pointer font-outfit"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    );
  }
}
