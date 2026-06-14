import { useState, useRef, useEffect, useCallback } from 'react';

export default function useRecorder() {
  const [recordingState, setRecordingState] = useState('idle'); // 'idle' | 'recording' | 'paused'
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  
  // Web Audio refs for real-time frequency analysis
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  // Stop timer helper
  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Start timer helper
  const startTimer = () => {
    stopTimer();
    setRecordingTime(0);
    timerIntervalRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  // Release the microphone stream and context
  const stopMicrophone = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      stopMicrophone();
    };
  }, [stopMicrophone]);

  // Start recording handler
  const startRecording = useCallback(async () => {
    try {
      setAudioBlob(null);
      audioChunksRef.current = [];

      // 1. Get or reuse mic stream
      let stream = streamRef.current;
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      }

      // 2. Setup or reuse Web Audio Context & Analyser
      let audioContext = audioContextRef.current;
      if (!audioContext || audioContext.state === 'closed') {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;
      }

      // 3. Setup MediaRecorder
      const options = { mimeType: 'audio/webm' };
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/ogg';
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = '';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
      };

      // 4. Start capturing chunks
      mediaRecorder.start(10);
      setRecordingState('recording');
      startTimer();
    } catch (error) {
      console.error('[Recorder Hook] Error starting recording:', error);
      setRecordingState('idle');
      throw new Error(error.name === 'NotAllowedError' ? 'Microphone permission denied.' : error.message);
    }
  }, []);

  // Stop recording handler
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopTimer();
    setRecordingState('idle');
    // Note: We keep streamRef.current and analyser active for VAD/barge-in monitoring
  }, []);

  // Cancel recording handler (discards audio chunks)
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    stopTimer();
    setRecordingState('idle');
    setAudioBlob(null);
    audioChunksRef.current = [];
    stopMicrophone();
  }, [stopMicrophone]);

  // Clear the recorded audio blob state to prevent reprocessing
  const clearAudioBlob = useCallback(() => {
    setAudioBlob(null);
  }, []);

  return {
    recordingState,
    recordingTime,
    audioBlob,
    analyser: analyserRef.current,
    stream: streamRef.current,
    audioContext: audioContextRef.current,
    startRecording,
    stopRecording,
    cancelRecording,
    stopMicrophone,
    clearAudioBlob
  };
}
