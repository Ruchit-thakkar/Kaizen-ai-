import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }

    try {
      setLocalError(null);
      setSubmitting(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-main-bg relative overflow-hidden px-4 select-none font-sans">
      {/* Subtle monochrome Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] h-[55%] w-[55%] rounded-full bg-white/[0.02] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[55%] w-[55%] rounded-full bg-white/[0.03] blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-elevated-card border border-border-color p-8 rounded-3xl shadow-2xl z-10 animate-slide-in">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 flex items-center justify-center mb-4">
            <img 
              src="https://ik.imagekit.io/devnext/kaizen%20ai%20logo" 
              alt="Kaizen AI Logo" 
              className="h-14 w-14 object-contain animate-pulse-glow" 
            />
          </div>
          <h2 className="text-2xl font-bold font-outfit text-white tracking-tight">Welcome back</h2>
          <p className="text-secondary-text text-xs mt-1.5 font-outfit">Enter details to access Kaizen AI</p>
        </div>

        {/* Error Display Alert */}
        {localError && (
          <div className="mb-5 p-3.5 bg-red-950/20 border border-red-900/35 rounded-2xl text-xs font-semibold text-red-300 animate-fade-in font-outfit">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-widest font-mono uppercase text-muted-text">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 h-4 w-4 text-muted-text" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-input-bg border border-border-color focus:border-white rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-muted-text focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-widest font-mono uppercase text-muted-text">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 h-4 w-4 text-muted-text" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-input-bg border border-border-color focus:border-white rounded-2xl py-3 pl-11 pr-11 text-sm text-white placeholder-muted-text focus:outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-muted-text hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center py-3.5 px-4 rounded-2xl bg-white hover:bg-secondary-text text-main-bg text-sm font-bold shadow-md hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-main-bg" />
            ) : (
              'Log In'
            )}
          </button>
        </form>

        {/* Navigation backlink */}
        <div className="mt-6 text-center text-xs text-secondary-text">
          Don't have an account?{' '}
          <Link to="/signup" className="text-white hover:underline font-bold transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
