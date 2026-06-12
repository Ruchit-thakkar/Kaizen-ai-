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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-main-bg text-white animate-fade-in">
        <div className="relative flex items-center justify-center">
          <div className="h-20 w-20 flex items-center justify-center animate-pulse">
            <img 
              src="https://ik.imagekit.io/devnext/kaizen%20ai%20logo" 
              alt="Kaizen AI Logo" 
              className="h-16 w-16 object-contain" 
            />
          </div>
          {/* Subtle pulse ring */}
          <div className="absolute top-0 left-0 h-20 w-20 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '2.5s' }} />
        </div>
        <span className="mt-5 text-[10px] font-semibold tracking-widest font-mono uppercase text-muted-text animate-pulse">
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
