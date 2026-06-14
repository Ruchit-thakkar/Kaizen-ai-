import { useState, useEffect, useRef } from 'react';

export default function useSpeechDetection({
  stream,
  isActive,
  silenceTimeoutMs = 2000,
  onSpeechStart,
  onSpeechEnd
}) {
  const [isSpeechDetected, setIsSpeechDetected] = useState(false);
  const [currentDb, setCurrentDb] = useState(-100);
  const [thresholdDb, setThresholdDb] = useState(-45);

  const animationFrameRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isSpeechActiveRef = useRef(false);

  // Calibration refs
  const calibrationFramesRef = useRef([]);
  const isCalibratedRef = useRef(false);

  useEffect(() => {
    if (!stream || !isActive) {
      // Clean up when recording stops or inactive
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      setIsSpeechDetected(false);
      isSpeechActiveRef.current = false;
      isCalibratedRef.current = false;
      calibrationFramesRef.current = [];
      return;
    }

    let audioCtx = null;
    let source = null;
    let analyser = null;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkAudio = () => {
        analyser.getByteTimeDomainData(dataArray);

        // Calculate Root Mean Square (RMS) of audio amplitude
        let totalSq = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = (dataArray[i] - 128) / 128; // normalize to [-1, 1]
          totalSq += val * val;
        }
        const rms = Math.sqrt(totalSq / bufferLength);
        
        // Convert to decibels (dB), clamping to a minimum of -100dB
        const db = rms > 0 ? 20 * Math.log10(rms) : -100;
        setCurrentDb(Math.round(db));

        // 1. Ambient Noise Calibration (first 30 frames / ~300ms)
        if (!isCalibratedRef.current) {
          if (calibrationFramesRef.current.length < 30) {
            calibrationFramesRef.current.push(db);
          } else {
            // Take average ambient noise level and set threshold
            const avgAmbient = calibrationFramesRef.current.reduce((a, b) => a + b, 0) / 30;
            // Speech threshold set to ambient + 12dB offset, clamped between -45dB and -30dB
            const calculatedThreshold = Math.min(Math.max(avgAmbient + 12, -45), -30);
            setThresholdDb(Math.round(calculatedThreshold));
            isCalibratedRef.current = true;
            console.log(`[VAD] Calibrated. Ambient: ${Math.round(avgAmbient)}dB, Threshold: ${Math.round(calculatedThreshold)}dB`);
          }
          animationFrameRef.current = requestAnimationFrame(checkAudio);
          return;
        }

        // 2. Speech Activity Detection
        if (db > thresholdDb) {
          // Speech detected
          if (!isSpeechActiveRef.current) {
            isSpeechActiveRef.current = true;
            setIsSpeechDetected(true);
            console.log('[VAD] Speech started detected.');
            if (onSpeechStart) onSpeechStart();
          }

          // Clear silence timer since user is speaking
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else {
          // Silence detected
          if (isSpeechActiveRef.current && !silenceTimerRef.current) {
            // Start the silence timeout timer
            silenceTimerRef.current = setTimeout(() => {
              isSpeechActiveRef.current = false;
              setIsSpeechDetected(false);
              console.log('[VAD] Silence timeout reached. Speech ended.');
              if (onSpeechEnd) onSpeechEnd();
              silenceTimerRef.current = null;
            }, silenceTimeoutMs);
          }
        }

        animationFrameRef.current = requestAnimationFrame(checkAudio);
      };

      // Start the RAF loop
      checkAudio();
    } catch (e) {
      console.error('[VAD] Error initializing audio analyzer:', e);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close();
      }
    };
  }, [stream, isActive, thresholdDb, silenceTimeoutMs, onSpeechStart, onSpeechEnd]);

  return {
    isSpeechDetected,
    currentDb,
    thresholdDb
  };
}
