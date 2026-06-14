import { speechToText, textToSpeech } from '../../services/speechService.js';

/**
 * Transcribe recorded audio uploaded from the client
 */
export const transcribeAudio = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file was uploaded.'
      });
    }

    const { language } = req.body;
    
    // Call the speech to text service
    const transcription = await speechToText(
      req.file.buffer,
      req.file.mimetype,
      language
    );

    res.status(200).json({
      success: true,
      text: transcription
    });
  } catch (error) {
    console.error('[Voice Controller] Transcription error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Speech recognition failed. Please try again.'
    });
  }
};

// In-memory cache map for active/concurrent speech synthesis promises to prevent duplicate requests
const activeRequests = new Map();

/**
 * Synthesize speech from text and stream it back as audio
 */
export const synthesizeSpeech = async (req, res, next) => {
  let cacheKey = '';
  try {
    const { text, voiceType, language, speed } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Text content is required for speech synthesis.'
      });
    }

    // Build key based on input parameters to identify identical requests
    const requestKey = JSON.stringify({
      text: text.trim(),
      voiceType: voiceType || 'female',
      language: language || 'en',
      speed: speed || 1.0
    });
    cacheKey = requestKey;

    let audioBuffer;

    if (activeRequests.has(requestKey)) {
      console.log('[Voice Controller] Duplicate concurrent request detected. Joining existing synthesis operation.');
      audioBuffer = await activeRequests.get(requestKey);
    } else {
      // Initiate synthesis and store the promise
      const promise = textToSpeech(
        text,
        voiceType,
        language,
        speed
      );
      activeRequests.set(requestKey, promise);
      
      try {
        audioBuffer = await promise;
      } catch (err) {
        // Clean up the promise map on error
        activeRequests.delete(requestKey);
        throw err;
      }
      // Clean up the promise map on success (we don't want to cache stale results forever, only join concurrent requests)
      activeRequests.delete(requestKey);
    }

    // Stream the audio back with correct MIME headers
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length
    });
    
    res.status(200).send(audioBuffer);
  } catch (error) {
    console.error('[Voice Controller] Synthesis error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Speech synthesis failed.'
    });
  }
};
