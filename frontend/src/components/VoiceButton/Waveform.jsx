import React, { useRef, useEffect } from 'react';

export default function Waveform({ analyser, isActive, voiceState }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const width = 180;
    const height = 48;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Check current state to adjust wave amplitude and styles
      let isRecording = voiceState === 'recording';
      let isSpeaking = voiceState === 'speaking';
      let isThinking = voiceState === 'thinking';
      let isTranscribing = voiceState === 'transcribing';

      if (!isActive || (!isRecording && !isSpeaking && !isThinking && !isTranscribing)) {
        // Draw standard subtle flat line
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.strokeStyle = 'rgba(141, 150, 167, 0.25)'; // muted-text low opacity
        ctx.lineWidth = 1.5;
        ctx.stroke();
        animationRef.current = requestAnimationFrame(draw);
        return;
      }

      // Time Domain Data for live microphone visualization
      let dataArray = null;
      let bufferLength = 0;
      if (analyser && isRecording) {
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);
      }

      phase += 0.08;

      // Draw multiple layers of overlapping waves for glassmorphic/generative look
      const drawSine = (color, amplitude, speed, waveCount) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;

        for (let x = 0; x < width; x++) {
          let y = height / 2;
          
          if (dataArray && isRecording) {
            // Live micro-analyser data deformation
            const index = Math.floor((x / width) * bufferLength);
            const amplitudeMultiplier = (dataArray[index] - 128) / 128; // scale between -1 and 1
            y += amplitudeMultiplier * amplitude * 1.5;
          } else {
            // Generative synthetic wave calculation (for thinking/speaking states)
            const angle = (x / width) * Math.PI * waveCount + phase * speed;
            // Dampen edges to make wave center-focused
            const dampening = Math.sin((x / width) * Math.PI);
            y += Math.sin(angle) * amplitude * dampening;
          }

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      };

      // Set different amplitudes based on states
      if (isRecording) {
        drawSine('rgba(255, 255, 255, 0.85)', 14, 1.0, 3.5);
        drawSine('rgba(141, 150, 167, 0.4)', 8, -0.8, 2.0);
      } else if (isSpeaking) {
        // Continuous organic voice-reply waves
        drawSine('rgba(255, 255, 255, 0.85)', 12, 1.2, 4.0);
        drawSine('rgba(141, 150, 167, 0.45)', 6, -1.0, 2.5);
      } else if (isThinking || isTranscribing) {
        // Slow thinking breathing pulse waves
        const pulse = Math.sin(phase * 0.4) * 3 + 6;
        drawSine('rgba(255, 255, 255, 0.65)', pulse, 0.5, 3.0);
        drawSine('rgba(141, 150, 167, 0.35)', pulse * 0.6, -0.4, 1.8);
      }

      ctx.shadowBlur = 0; // Reset shadow
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, analyser, voiceState]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-[180px] h-[48px] block pointer-events-none select-none bg-transparent" 
    />
  );
}
