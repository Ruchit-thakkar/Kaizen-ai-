import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';

/**
 * Guard Component: Blocks unauthorized access to chat panel.
 * Displays premium loader during initial token lookup.
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0b0d12] text-zinc-200">
        <div className="relative flex items-center justify-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-500/25 animate-pulse">
            <Sparkles className="h-6 w-6 text-white animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          {/* Pulsing ring animation */}
          <div className="absolute top-0 left-0 h-14 w-14 rounded-2xl border-2 border-indigo-500/35 animate-ping" />
        </div>
        <span className="mt-5 text-[10px] font-semibold tracking-widest font-mono uppercase text-zinc-500 animate-pulse">
          Resuming Session
        </span>
      </div>
    );
  }

  // Redirect to login if user object is not initialized
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
