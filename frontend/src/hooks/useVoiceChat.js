import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import useSpeechDetection from './useSpeechDetection';

export default function useVoiceChat({
  sendMessage,
  messages,
  isGenerating,
  activeConversationId,
  stream,
  recordingState,
  stopRecording,
  startRecording
}) {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceType, setVoiceType] = useState('female'); // 'female' | 'male'
  const [voiceSpeed, setVoiceSpeed] = useState(1.0); // 0.8 | 1.0 | 1.2
  const [voiceLanguage, setVoiceLanguage] = useState('en'); // 'en' | 'hi' | 'gu'
  
  const [voiceState, setVoiceState] = useState('idle'); // 'idle' | 'recording' | 'transcribing' | 'thinking'
  const [uploadError, setUploadError] = useState(null);

  // Stop speaking wrapper (no-op now that TTS is removed)
  const stopSpeaking = useCallback(() => {
    setVoiceState('idle');
  }, []);

  // Speak response manually (no-op now that TTS is removed)
  const speakResponse = useCallback((text) => {
    setVoiceState('idle');
  }, []);

  // Transcribe recorded audio blob
  const transcribeAudioFile = useCallback(async (blob) => {
    try {
      setVoiceState('transcribing');
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', blob, 'recording.webm');
      formData.append('language', voiceLanguage);

      const response = await api.post('/voice/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.success && response.data.text) {
        const text = response.data.text;
        console.log('[Voice Chat] Transcribed text:', text);
        
        // Feed text to chatbot
        setVoiceState('thinking');
        sendMessage(text);
      } else {
        throw new Error('Speech recognition came back empty.');
      }
    } catch (err) {
      console.error('[Voice Chat] Transcription error:', err);
      setUploadError(err.response?.data?.message || err.message || 'Unable to recognize speech.');
      setVoiceState('idle');
    }
  }, [voiceLanguage, sendMessage]);

  // Transition back to idle (ready state) when AI response generation is complete
  useEffect(() => {
    if (!isGenerating && (voiceState === 'thinking' || voiceState === 'transcribing')) {
      console.log('[Voice Chat] AI generation complete. Resetting voice state to idle.');
      setVoiceState('idle');
    }
  }, [isGenerating, voiceState]);

  // 1. Silence Auto-Stop Callback
  const handleSpeechEnd = () => {
    if (recordingState === 'recording') {
      console.log('[VAD] Silence detected. Automatically stopping recording.');
      stopRecording();
    }
  };

  // VAD decibel listener connected to mic (only active during recording when TTS is removed)
  const isVADActive = recordingState === 'recording';

  useSpeechDetection({
    stream,
    isActive: isVADActive,
    silenceTimeoutMs: 2000,
    onSpeechStart: null, // No barge-in needed since TTS is disabled
    onSpeechEnd: handleSpeechEnd
  });

  return {
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
  };
}
