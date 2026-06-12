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
    <div className="h-screen w-screen flex items-center justify-center bg-[#0b0d12] relative overflow-hidden px-4 select-none font-sans">
      {/* Background glow effects */}
      <div className="absolute top-[-15%] left-[-15%] h-[60%] w-[60%] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] h-[60%] w-[60%] rounded-full bg-pink-500/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-xl border border-zinc-850/80 p-8 rounded-3xl shadow-2xl z-10 animate-slide-in">
        {/* Logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-550/20 mb-4 scale-95 hover:scale-100 transition-transform duration-300">
            <Sparkles className="h-6 w-6 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold font-outfit text-white tracking-tight">Welcome back</h2>
          <p className="text-zinc-500 text-xs mt-1.5">Enter details to access Kaizen AI</p>
        </div>

        {/* Error Display Alert */}
        {localError && (
          <div className="mb-5 p-3.5 bg-red-950/10 border border-red-500/20 rounded-2xl text-xs font-semibold text-red-400 animate-fade-in">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-widest font-mono uppercase text-zinc-500">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-zinc-950/40 border border-zinc-850 focus:border-zinc-700 rounded-2xl py-3 pl-11 pr-4 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-widest font-mono uppercase text-zinc-500">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 h-4 w-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950/40 border border-zinc-850 focus:border-zinc-700 rounded-2xl py-3 pl-11 pr-11 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-zinc-500 hover:text-zinc-350 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center py-3.5 px-4 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white text-sm font-semibold hover:opacity-95 shadow-md shadow-indigo-550/10 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              'Log In'
            )}
          </button>
        </form>

        {/* Navigation backlink */}
        <div className="mt-6 text-center text-xs text-zinc-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:underline font-semibold hover:text-indigo-350 transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
