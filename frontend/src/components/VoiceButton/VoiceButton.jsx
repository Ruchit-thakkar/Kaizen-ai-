import React from 'react';
import { Mic, Square, X, Loader2 } from 'lucide-react';
import useRecorder from '../../hooks/useRecorder';
import useVoiceChat from '../../hooks/useVoiceChat';
import Waveform from './Waveform';

export default function VoiceButton({ sendMessage, messages, isGenerating, activeConversationId }) {
  const {
    recordingState,
    recordingTime,
    audioBlob,
    analyser,
    stream,
    startRecording,
    stopRecording,
    cancelRecording,
    stopMicrophone,
    clearAudioBlob
  } = useRecorder();

  const {
    voiceEnabled,
    setVoiceEnabled,
    voiceType,
    setVoiceType,
    voiceSpeed,
    setVoiceSpeed,
    voiceLanguage,
    setVoiceLanguage,
    voiceState,
    setVoiceState,
    uploadError,
    setUploadError,
    transcribeAudioFile,
    stopSpeaking,
    speakResponse
  } = useVoiceChat({
    sendMessage,
    messages,
    isGenerating,
    activeConversationId,
    stream,
    recordingState,
    stopRecording,
    startRecording
  });

  // Triggered when recording stops and audioBlob is populated
  React.useEffect(() => {
    if (audioBlob) {
      transcribeAudioFile(audioBlob);
      clearAudioBlob();
    }
  }, [audioBlob, transcribeAudioFile, clearAudioBlob]);

  // Format recording timer: e.g. 00:05
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Start Voice Chat recording
  const handleMicClick = async () => {
    stopSpeaking();
    setUploadError(null);
    try {
      setVoiceState('recording');
      await startRecording();
    } catch (err) {
      setUploadError(err.message || 'Microphone access denied.');
      setVoiceState('idle');
    }
  };

  // Stop recording and process text
  const handleStopRecording = () => {
    stopRecording();
  };

  // Discard recording
  const handleCancelRecording = () => {
    cancelRecording();
    setVoiceState('idle');
  };

  const isRecording = voiceState === 'recording' || recordingState === 'recording';
  const isSpeaking = voiceState === 'speaking';
  const isThinking = voiceState === 'thinking';
  const isTranscribing = voiceState === 'transcribing';

  return (
    <div className="flex items-center gap-2 relative">

      {/* Main Microphone Action Button */}
      {isRecording ? (
        /* Expanded Recording Overlay Panel */
        <div className="absolute bottom-11 right-0 w-[310px] bg-elevated-card border border-border-color rounded-2xl p-2.5 shadow-2xl flex items-center gap-3 animate-slide-in select-none">
          {/* Live Waveform */}
          <div className="flex-1 min-w-0">
            <Waveform analyser={analyser} isActive={true} voiceState={voiceState} />
          </div>

          {/* Time Counter */}
          <span className="text-xs text-white font-mono shrink-0 font-semibold bg-input-bg border border-border-color/60 px-2 py-1 rounded-lg">
            {formatTime(recordingTime)}
          </span>

          {/* Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleCancelRecording}
              className="p-1.5 rounded-xl hover:bg-input-bg text-secondary-text hover:text-red-400 border border-transparent hover:border-border-color transition-all cursor-pointer focus:outline-none"
              title="Cancel recording"
            >
              <X className="h-4 w-4" />
            </button>
            
            {/* Stop/Send Button */}
            <button
              type="button"
              onClick={handleStopRecording}
              className="p-1.5 rounded-xl bg-white text-main-bg hover:bg-secondary-text shadow-md transition-all cursor-pointer focus:outline-none animate-pulse"
              title="Stop and transcribe"
            >
              <Square className="h-4 w-4 fill-main-bg text-main-bg" />
            </button>
          </div>
        </div>
      ) : isSpeaking ? (
        /* Speaking Interrupt Button */
        <button
          type="button"
          onClick={stopSpeaking}
          className="p-2 rounded-xl bg-red-500 hover:bg-red-600 border border-red-400 text-white shadow-lg shadow-red-500/10 transition-all cursor-pointer focus:outline-none select-none active:scale-95 flex items-center gap-1.5"
          title="Stop reading aloud"
        >
          <Square className="h-4 w-4 fill-white text-white" />
          <span className="text-[11px] font-bold uppercase tracking-wider font-outfit pr-0.5">Speaking</span>
        </button>
      ) : isThinking || isTranscribing ? (
        /* Processing Loading State */
        <button
          type="button"
          disabled
          className="p-2 rounded-xl bg-elevated-card border border-border-color/80 text-muted-text transition-all cursor-not-allowed select-none flex items-center gap-1.5"
          title={isTranscribing ? 'Transcribing speech...' : 'Kaizen AI is thinking...'}
        >
          <Loader2 className="h-4 w-4 animate-spin text-white" />
          <span className="text-[11px] font-semibold uppercase tracking-wider font-outfit text-white pr-0.5">
            {isTranscribing ? 'Transcribing' : 'Thinking'}
          </span>
        </button>
      ) : (
        /* Standard Microphone Button */
        <button
          type="button"
          onClick={handleMicClick}
          className="p-2 rounded-xl bg-elevated-card border border-border-color/85 text-secondary-text hover:border-white/50 hover:text-white transition-all cursor-pointer focus:outline-none select-none active:scale-95"
          title="Speak to Kaizen AI"
        >
          <Mic className="h-4 w-4" />
        </button>
      )}

      {/* Floating Upload/STT error warnings */}
      {uploadError && (
        <div className="absolute bottom-11 right-0 bg-input-bg border border-border-color px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 z-30 max-w-xs animate-slide-in">
          <span className="text-xs text-red-400 font-outfit font-medium leading-normal">{uploadError}</span>
          <button 
            type="button" 
            onClick={() => setUploadError(null)} 
            className="p-0.5 hover:bg-elevated-card rounded text-muted-text hover:text-white cursor-pointer ml-auto focus:outline-none"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
