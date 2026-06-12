import React from 'react';
import { Link } from 'react-router-dom';

export default function ErrorPage({ type = '404' }) {
  let title = 'Page Not Found';
  let message = "The page you are looking for doesn't exist or has been moved.";
  let code = '404';

  if (type === '500') {
    title = 'Internal Server Error';
    message = 'Something went wrong on our servers. Please try again later.';
    code = '500';
  } else if (type === 'network') {
    title = 'Network Connection Error';
    message = 'Unable to connect to the server. Please check your internet connection and try again.';
    code = 'Connection Error';
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-main-bg text-white px-4 text-center font-sans">
      <div className="flex flex-col items-center max-w-md bg-elevated-card border border-border-color p-8 rounded-3xl shadow-2xl animate-slide-in">
        <img 
          src="https://ik.imagekit.io/devnext/kaizen%20ai%20logo" 
          alt="Kaizen AI Logo" 
          className="h-16 w-16 object-contain mb-6 animate-pulse-glow" 
        />
        <span className="text-[10px] font-bold tracking-widest font-mono uppercase text-muted-text mb-1">
          Error {code}
        </span>
        <h2 className="text-xl font-bold font-outfit text-white mb-2">
          {title}
        </h2>
        <p className="text-secondary-text text-sm font-light leading-relaxed font-outfit mb-6">
          {message}
        </p>
        <Link 
          to="/" 
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-secondary-text text-main-bg text-xs font-bold transition-all shadow-md active:scale-95 font-outfit"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
