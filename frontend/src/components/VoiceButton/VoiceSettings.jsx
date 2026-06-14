import React from 'react';
import { X, Globe, User, Gauge } from 'lucide-react';

export default function VoiceSettings({
  voiceType,
  setVoiceType,
  voiceSpeed,
  setVoiceSpeed,
  voiceLanguage,
  setVoiceLanguage,
  isOpen,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/55 backdrop-blur-xs animate-fade-in"
      />
      
      {/* Settings Dialog */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-elevated-card border border-border-color p-5 rounded-3xl shadow-2xl animate-slide-in text-white select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-color/60 pb-3 mb-4.5">
          <span className="text-sm font-bold font-outfit uppercase tracking-wider text-white">Voice Customization</span>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-input-bg text-secondary-text hover:text-white transition-colors cursor-pointer focus:outline-none"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 font-outfit text-sm">
          
          {/* Language selection */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs text-muted-text font-semibold uppercase tracking-wider">
              <Globe className="h-3.5 w-3.5" />
              Language
            </label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { id: 'en', label: 'English' },
                { id: 'hi', label: 'Hindi' },
                { id: 'gu', label: 'Gujarati' }
              ].map((lang) => {
                const isActive = voiceLanguage === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setVoiceLanguage(lang.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none focus:outline-none ${
                      isActive 
                        ? 'bg-white text-main-bg border-white shadow-md' 
                        : 'bg-input-bg border-border-color/60 text-secondary-text hover:border-white/40'
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice gender selector */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs text-muted-text font-semibold uppercase tracking-wider">
              <User className="h-3.5 w-3.5" />
              Voice Avatar
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {[
                { id: 'female', label: 'Female' },
                { id: 'male', label: 'Male' }
              ].map((avatar) => {
                const isActive = voiceType === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setVoiceType(avatar.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer select-none focus:outline-none ${
                      isActive 
                        ? 'bg-white text-main-bg border-white shadow-md' 
                        : 'bg-input-bg border-border-color/60 text-secondary-text hover:border-white/40'
                    }`}
                  >
                    {avatar.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Speed control */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs text-muted-text font-semibold uppercase tracking-wider">
              <Gauge className="h-3.5 w-3.5" />
              Tempo Speed
            </label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                { value: 0.8, label: '0.8x (Slow)' },
                { value: 1.0, label: '1.0x (Normal)' },
                { value: 1.2, label: '1.2x (Fast)' }
              ].map((speedOpt) => {
                const isActive = voiceSpeed === speedOpt.value;
                return (
                  <button
                    key={speedOpt.value}
                    type="button"
                    onClick={() => setVoiceSpeed(speedOpt.value)}
                    className={`px-2 py-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer select-none focus:outline-none ${
                      isActive 
                        ? 'bg-white text-main-bg border-white shadow-md' 
                        : 'bg-input-bg border-border-color/60 text-secondary-text hover:border-white/40'
                    }`}
                  >
                    {speedOpt.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 pb-1">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white hover:bg-secondary-text text-main-bg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer font-outfit"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </>
  );
}
