import axios from 'axios';
import env from '../config/env.js';

/**
 * Convert user spoken audio into text using Groq's Whisper model
 * @param {Buffer} audioBuffer - Binary audio file data
 * @param {string} mimeType - Audio MIME type (e.g., audio/webm)
 * @param {string} [language] - Optional ISO 2-letter language code (e.g., 'en', 'hi', 'gu')
 * @returns {Promise<string>} Transcribed text response
 */
export const speechToText = async (audioBuffer, mimeType, language) => {
  const apiKey = env.STT_API_KEY || env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('STT_API_KEY or GROQ_API_KEY is not defined in environment variables.');
  }

  try {
    console.log(`[Speech Service] Sending audio to Groq Whisper transcription API (mimeType: ${mimeType || 'audio/webm'}, language: ${language || 'auto'})`);
    
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType || 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-large-v3');
    
    if (language) {
      formData.append('language', language);
    }

    const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.data && response.data.text) {
      console.log(`[Speech Service] Transcription successful: "${response.data.text.slice(0, 40)}..."`);
      return response.data.text;
    } else {
      throw new Error('Transcription API did not return text.');
    }
  } catch (error) {
    console.error('[Speech Service] Speech-to-Text error:', error.response?.data || error.message);
    throw new Error(`Speech recognition failed: ${error.response?.data?.error?.message || error.message}`);
  }
};

/**
 * Generate speech audio from text using NVIDIA NIM Magpie/Riva TTS
 * @param {string} text - Text to synthesize
 * @param {string} [voiceType] - 'female' or 'male'
 * @param {string} [language] - 'en', 'hi', 'gu' etc.
 * @param {number} [speed] - Playback rate multiplier (e.g. 1.0)
 * @returns {Promise<Buffer>} Binary audio stream data (usually audio/mpeg or audio/wav)
 */
export const textToSpeech = async (text, voiceType = 'female', language = 'en', speed = 1.0) => {
  const apiKey = env.TTS_API_KEY || env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error('TTS_API_KEY or NVIDIA_API_KEY is not defined in environment variables.');
  }

  try {
    console.log(`[Speech Service] Sending text to NVIDIA TTS NIM (voice: ${voiceType}, language: ${language}, speed: ${speed})`);
    
    // Choose appropriate voice key based on voice type and language
    // Magpie / Riva voice naming schemes typically look like: "Magpie-Multilingual.EN-US.Aria"
    const voiceMapping = {
      en: {
        female: 'Magpie-Multilingual.EN-US.Aria',
        male: 'Magpie-Multilingual.EN-US.Benjamin'
      },
      hi: {
        female: 'Magpie-Multilingual.HI-IN.Aadya',
        male: 'Magpie-Multilingual.HI-IN.Kabir'
      },
      gu: {
        female: 'Magpie-Multilingual.HI-IN.Aadya', // Fallback to Hindi voices if Gujarati specific voice NIM not deployed
        male: 'Magpie-Multilingual.HI-IN.Kabir'
      }
    };

    const targetLang = voiceMapping[language] ? language : 'en';
    const voice = voiceMapping[targetLang][voiceType] || voiceMapping.en.female;

    const response = await axios.post(
      'https://integrate.api.nvidia.com/v1/audio/speech',
      {
        model: 'nvidia/magpie-tts-zeroshot',
        input: text,
        voice: voice,
        response_format: 'mp3',
        speed: speed || 1.0
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      }
    );

    return Buffer.from(response.data);
  } catch (error) {
    console.error('[Speech Service] Text-to-Speech error:', error.response?.data || error.message);
    throw new Error(`Voice generation failed: ${error.response?.data?.error?.message || error.message}`);
  }
};
