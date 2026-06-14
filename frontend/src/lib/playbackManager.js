import api from '../services/api';

export class PlaybackManager {
  constructor({ voiceType, language, speed, onStart, onEnd }) {
    this.voiceType = voiceType;
    this.language = language;
    this.speed = speed;
    
    this.onStart = onStart;
    this.onEnd = onEnd;

    this.queue = [];
    this.isPlaying = false;
    this.currentAudio = null;
    
    // Fallback SpeechSynthesis state
    this.utteranceQueue = [];
    this.isLocalSynthesisActive = false;

    // Speech synthesis caching to avoid double calls
    this.activeSyntheses = new Set();
  }

  updateSettings({ voiceType, language, speed }) {
    this.voiceType = voiceType;
    this.language = language;
    this.speed = speed;
  }

  /**
   * Queue a sentence text for TTS generation and sequential playback
   */
  async queueSentence(text) {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();

    // Prevent duplicate calls
    if (this.activeSyntheses.has(cleanText)) return;
    this.activeSyntheses.add(cleanText);

    console.log(`[Playback Manager] Queuing sentence: "${cleanText.slice(0, 35)}..."`);

    try {
      // 1. Try server-side synthesis
      const response = await api.post('/voice/synthesize', {
        text: cleanText,
        voiceType: this.voiceType,
        language: this.language,
        speed: this.speed
      }, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      // Store cleanup metadata
      const queueItem = {
        type: 'audio',
        audio,
        url: audioUrl,
        text: cleanText
      };

      this.queue.push(queueItem);
      this.activeSyntheses.delete(cleanText);

      // Trigger queue processing
      this.processQueue();
    } catch (err) {
      console.warn(`[Playback Manager] Server TTS synthesis failed for "${cleanText.slice(0, 20)}". Falling back to local SpeechSynthesis.`, err.message);
      this.activeSyntheses.delete(cleanText);

      // 2. Local fallback SpeechSynthesis queue item
      const queueItem = {
        type: 'speech',
        text: cleanText
      };
      
      this.queue.push(queueItem);
      this.processQueue();
    }
  }

  /**
   * Process the playback queue sequentially
   */
  async processQueue() {
    if (this.isPlaying || this.queue.length === 0) return;

    this.isPlaying = true;
    if (this.onStart) this.onStart();

    const currentItem = this.queue[0];

    if (currentItem.type === 'audio') {
      const { audio, url } = currentItem;
      this.currentAudio = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
        this.queue.shift(); // Remove completed item
        this.isPlaying = false;
        this.currentAudio = null;
        this.processQueue(); // Loop
      };

      audio.onerror = (e) => {
        console.error('[Playback Manager] Audio playback error, skipping:', e);
        URL.revokeObjectURL(url);
        this.queue.shift();
        this.isPlaying = false;
        this.currentAudio = null;
        this.processQueue();
      };

      try {
        await audio.play();
      } catch (playErr) {
        console.warn('[Playback Manager] Audio play interrupted, skipping:', playErr.message);
        audio.onerror(playErr);
      }
    } else if (currentItem.type === 'speech') {
      // Native browser SpeechSynthesis fallback
      if (!window.speechSynthesis) {
        this.queue.shift();
        this.isPlaying = false;
        this.processQueue();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(currentItem.text);
      utterance.rate = this.speed || 1.0;
      
      const localeMap = { en: 'en-US', hi: 'hi-IN', gu: 'gu-IN' };
      utterance.lang = localeMap[this.language] || 'en-US';

      // Pick matching native voice
      const voices = window.speechSynthesis.getVoices();
      const langVoices = voices.filter(v => v.lang.startsWith(this.language));
      if (langVoices.length > 0) {
        const femaleKeywords = ['zira', 'hazel', 'female', 'susan', 'haruka', 'heera'];
        const maleKeywords = ['david', 'mark', 'male', 'george', 'ravi'];
        const targetKeywords = this.voiceType === 'female' ? femaleKeywords : maleKeywords;
        
        let voice = langVoices.find(v => targetKeywords.some(kw => v.name.toLowerCase().includes(kw)));
        if (!voice) voice = langVoices[0];
        utterance.voice = voice;
      }

      utterance.onend = () => {
        this.queue.shift();
        this.isPlaying = false;
        this.processQueue();
      };

      utterance.onerror = (e) => {
        console.error('[Playback Manager] Local speech utterance error:', e);
        this.queue.shift();
        this.isPlaying = false;
        this.processQueue();
      };

      window.speechSynthesis.speak(utterance);
    }

    // Check if queue is fully empty
    if (this.queue.length === 0) {
      this.isPlaying = false;
      if (this.onEnd) this.onEnd();
    }
  }

  /**
   * Stop all active playback immediately and flush the queue (Interruption)
   */
  stop() {
    console.log('[Playback Manager] Stopping and flushing all voice streams.');
    
    // Stop local audio element
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
      } catch (e) {}
      this.currentAudio = null;
    }

    // Revoke any object URLs in queue
    this.queue.forEach(item => {
      if (item.type === 'audio' && item.url) {
        URL.revokeObjectURL(item.url);
      }
    });

    // Clear queue
    this.queue = [];
    this.isPlaying = false;
    this.activeSyntheses.clear();

    // Cancel native SpeechSynthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (this.onEnd) this.onEnd();
  }
}
