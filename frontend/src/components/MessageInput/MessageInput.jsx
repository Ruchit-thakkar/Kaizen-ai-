import React, { useRef, useEffect, useState } from 'react';
import { Send, Square, ChevronDown, Check, Paperclip } from 'lucide-react';
import FilePreview from '../FilePreview/FilePreview';
import api from '../../services/api';
import VoiceButton from '../VoiceButton/VoiceButton';

const AVAILABLE_MODELS = [
  {
    id: "gptOss120b",
    name: "GPT OSS 120B",
    provider: "OPENAI",
    description: "Advanced reasoning and premium quality."
  },
  {
    id: "gemini25Flash",
    name: "Gemini 2.5 Flash",
    provider: "GOOGLE",
    description: "Fast and balanced."
  },
  {
    id: "deepseekFlash",
    name: "DeepSeek V4 Flash",
    provider: "NVIDIA",
    description: "Best for speed and agents."
  },
  {
    id: "llama70b",
    name: "Llama 3.3 70B",
    provider: "META",
    description: "General-purpose conversations."
  }
];

export default function MessageInput({ 
  onSendMessage, 
  isGenerating, 
  onStopGeneration,
  activeModel = "gptOss120b",
  changeConversationModel,
  activeConversationId,
  messages = []
}) {
  const [input, setInput] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const MAX_CHARS = 4000;

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const getFileTypeCategory = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const images = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const documents = ['pdf', 'txt', 'docx', 'md'];
    const code = ['js', 'ts', 'jsx', 'tsx', 'py', 'cpp', 'java', 'html', 'css', 'php'];
    const audio = ['mp3', 'wav', 'm4a', 'ogg'];
    const video = ['mp4', 'mov', 'avi', 'webm'];
    
    if (images.includes(extension)) return 'image';
    if (documents.includes(extension)) return 'document';
    if (code.includes(extension)) return 'code';
    if (audio.includes(extension)) return 'audio';
    if (video.includes(extension)) return 'video';
    
    return null;
  };

  const BLOCKED_EXTENSIONS = ['exe', 'dll', 'bat', 'apk', 'iso', 'sh'];
  const SIZE_LIMITS = {
    image: 20 * 1024 * 1024,
    document: 50 * 1024 * 1024,
    code: 10 * 1024 * 1024,
    audio: 50 * 1024 * 1024,
    video: 200 * 1024 * 1024
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const extension = file.name.split('.').pop().toLowerCase();

    if (BLOCKED_EXTENSIONS.includes(extension)) {
      setUploadError(`Extension .${extension} is blocked for security reasons.`);
      e.target.value = '';
      return;
    }

    const category = getFileTypeCategory(file.name);
    if (!category) {
      setUploadError(`File type .${extension} is not supported.`);
      e.target.value = '';
      return;
    }

    const limit = SIZE_LIMITS[category];
    if (file.size > limit) {
      const limitMb = limit / (1024 * 1024);
      setUploadError(`File exceeds size limit of ${limitMb}MB.`);
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    setAttachment({ name: file.name, size: file.size, fileType: category });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        setAttachment(response.data.data);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('File upload failed:', err);
      setUploadError(err.response?.data?.message || err.message || 'Unable to upload file. Please try again.');
      setAttachment(null);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const hasInput = input.trim().length > 0;
    if ((!hasInput && !attachment) || isGenerating || isUploading || input.length > MAX_CHARS) return;

    onSendMessage(input.trim(), attachment);
    setInput('');
    setAttachment(null);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setInput(val);
    }
  };

  const currentModelObj = AVAILABLE_MODELS.find(m => m.id === activeModel) || AVAILABLE_MODELS[0];

  return (
    <form onSubmit={handleSubmit} className="w-full relative max-w-[1100px] mx-auto px-4 md:px-6 select-none font-sans">
      
      {/* Input container with slightly reduced height (padding decreased) */}
      <div className="relative flex flex-col w-full rounded-3xl bg-input-bg border border-border-color focus-within:border-white/80 transition-all duration-200 shadow-xl p-2.5">
        
        {/* Render File Preview inside Input Container */}
        {attachment && (
          <div className="px-2 pb-2">
            <FilePreview
              file={attachment}
              onRemove={() => setAttachment(null)}
              isUploading={isUploading}
            />
          </div>
        )}

        {/* Upload error display */}
        {uploadError && (
          <div className="px-2.5 pb-2 text-red-400 text-xs font-outfit flex items-center gap-1.5 animate-fade-in">
            <span>⚠️</span>
            <span>{uploadError}</span>
            <button type="button" onClick={() => setUploadError(null)} className="ml-auto hover:text-white cursor-pointer focus:outline-none">✕</button>
          </div>
        )}

        {/* Top Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask Kaizen AI anything..."
          rows={1}
          className="w-full bg-transparent text-white px-2 py-1 resize-none focus:outline-none placeholder-muted-text text-base leading-relaxed max-h-52 min-h-[40px]"
        />

        {/* Footer controls: Model selector and Action buttons */}
        <div className="flex items-center justify-between border-t border-border-color/30 pt-2.5 mt-1 px-1 relative">
          
          {/* Model Selector and Upload Button inside container */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-elevated-card border border-border-color/85 hover:border-white/60 text-xs text-secondary-text hover:text-white transition-all cursor-pointer font-outfit select-none focus:outline-none"
              >
                <span className="font-semibold">{currentModelObj.name}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-text transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Model Dropdown Overlay inside Boundaries */}
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  
                  <div className="absolute bottom-9 left-0 w-80 bg-elevated-card border border-border-color rounded-2xl p-1.5 shadow-2xl z-50 animate-slide-in flex flex-col gap-0.5 max-h-[450px] overflow-y-auto scrollbar-thin">
                    <div className="px-3 py-1.5 border-b border-border-color/60 flex flex-col mb-1">
                      <span className="text-[9px] uppercase tracking-widest text-muted-text font-bold font-mono">Select AI Engine</span>
                    </div>
                    {AVAILABLE_MODELS.map((m) => {
                      const isSelected = m.id === activeModel;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            changeConversationModel(activeConversationId, m.id);
                            setDropdownOpen(false);
                          }}
                          className={`flex items-start justify-between px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                            isSelected 
                              ? 'bg-white/10 border border-white/20' 
                              : 'hover:bg-input-bg border border-transparent hover:border-border-color/40'
                          }`}
                        >
                          <div className="flex flex-col text-left min-w-0">
                            {/* Company Name: Larger, Bold, Uppercase */}
                            <span className="text-xs font-black tracking-widest text-white/95 uppercase font-outfit">
                              {m.provider}
                            </span>
                            {/* Model Name */}
                            <span className={`text-[13px] font-semibold mt-0.5 ${isSelected ? 'text-white' : 'text-secondary-text'}`}>
                              {m.name}
                            </span>
                            {/* Purpose: Muted text */}
                            <span className="text-[11px] text-muted-text font-light mt-1 leading-normal font-outfit">
                              {m.description}
                            </span>
                          </div>
                          {isSelected && <Check className="h-3.5 w-3.5 text-white shrink-0 ml-2 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Hidden Input and + Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleFileSelect}
              disabled={isGenerating || isUploading}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-elevated-card border border-border-color/85 hover:border-white/60 text-xs text-secondary-text hover:text-white transition-all cursor-pointer font-outfit focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-97 select-none"
              title="Upload files"
            >
              <Paperclip className="h-3.5 w-3.5 text-muted-text" />
              <span className="font-semibold">+ Upload</span>
            </button>
          </div>

          {/* Right Controls: Voice recorder, Char Counter and Submit/Stop buttons */}
          <div className="flex items-center gap-3">
            <VoiceButton
              sendMessage={onSendMessage}
              messages={messages}
              isGenerating={isGenerating}
              activeConversationId={activeConversationId}
            />

            <span className="text-[10px] text-muted-text font-mono">
              {input.length} / {MAX_CHARS}
            </span>
            
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="flex items-center justify-center h-8 w-8 rounded-xl bg-white hover:bg-secondary-text text-main-bg transition-all shadow-md cursor-pointer"
                title="Stop generating"
              >
                <Square className="h-3.5 w-3.5 fill-main-bg text-main-bg" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={(!input.trim() && !attachment) || isUploading}
                className={`flex items-center justify-center h-8 w-8 rounded-xl transition-all shadow-md cursor-pointer
                  ${(input.trim() || attachment) && !isUploading
                    ? 'bg-white text-main-bg hover:bg-secondary-text' 
                    : 'bg-elevated-card text-muted-text/30 cursor-not-allowed'}
                `}
                title="Send message"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>
    </form>
  );
}
