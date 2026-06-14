import { resolveModel } from './modelRouter.service.js';
import { generateNVIDIAStream, generateGroqStream } from './provider.service.js';
import { parseSSEStream } from './streaming.service.js';
import { generateStream } from '../ai/ai.service.js';

/**
 * Generate a streaming response across the multi-model architecture.
 * Formats system instructions and messages to OpenAI specification.
 * @param {Array<Object>} messages - Messages sliding window [{ role: 'user'|'assistant', content: string }]
 * @param {Object} options - Configurations
 * @param {string} options.modelKey - Selected model key (e.g. 'deepseekFlash')
 * @param {string} [options.systemInstruction] - Dynamic system instructions including facts and preferences
 * @param {AbortSignal} [options.signal] - Abort signal to cancel execution
 * @returns {Promise<AsyncGenerator<{text: string}>>} Async generator yielding response delta chunks
 */
export const generateMultiModelStream = async (messages, options = {}) => {
  let { modelKey, systemInstruction, signal } = options;

  // 1. Check if there is an attachment on the latest user message
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
  const attachment = lastUserMessage?.attachment;
  
  let processedSystemInstruction = systemInstruction || '';

  if (attachment) {
    const { fileType } = attachment;
    console.log(`[Model Service] Processing attachment of type "${fileType}"`);

    // Override text-only models for binary multimodal files (image, audio, video, pdf)
    const isMultimodalFile = ['image', 'audio', 'video', 'document'].includes(fileType);
    const isTextOnlyModel = modelKey !== 'gemini25Flash';
    
    if (isMultimodalFile && isTextOnlyModel) {
      console.log(`[Model Router] Overriding text-only engine "${modelKey}" to "gemini25Flash" for multimodal file.`);
      modelKey = 'gemini25Flash';
    }

    // Call corresponding service instructions
    if (fileType === 'image') {
      const { getInstructions } = await import('../../services/imageService.js');
      processedSystemInstruction = `${getInstructions()}\n\n${processedSystemInstruction}`;
    } else if (fileType === 'document') {
      const { getInstructions, parseDocx } = await import('../../services/pdfService.js');
      processedSystemInstruction = `${getInstructions()}\n\n${processedSystemInstruction}`;
      
      // If it's a docx file, we extract its text and inject it into the prompt
      if (attachment.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || attachment.name.endsWith('.docx')) {
        try {
          if (attachment.localPath) {
            const extractedText = await parseDocx(attachment.localPath);
            lastUserMessage.content = `[Attached Word Document Content]:\n${extractedText}\n\n${lastUserMessage.content}`;
            // Remove attachment since it's converted to text
            delete lastUserMessage.attachment;
          }
        } catch (err) {
          console.error('[Model Service] Error parsing docx:', err.message);
        }
      }
    } else if (fileType === 'code') {
      const { getInstructions, readCodeFile } = await import('../../services/codeService.js');
      processedSystemInstruction = `${getInstructions()}\n\n${processedSystemInstruction}`;
      
      // We read the code file and inject it into the message prompt
      try {
        const codeContent = await readCodeFile(attachment);
        lastUserMessage.content = `[Code File: ${attachment.name}]\n\`\`\`\n${codeContent}\n\`\`\`\n\n${lastUserMessage.content}`;
        // Remove attachment object so text-only models don't crash
        delete lastUserMessage.attachment;
      } catch (err) {
        console.error('[Model Service] Error parsing code file:', err.message);
      }
    } else if (fileType === 'audio') {
      const { getInstructions } = await import('../../services/audioService.js');
      processedSystemInstruction = `${getInstructions()}\n\n${processedSystemInstruction}`;
    } else if (fileType === 'video') {
      const { getInstructions } = await import('../../services/videoService.js');
      processedSystemInstruction = `${getInstructions()}\n\n${processedSystemInstruction}`;
    }
  }

  // Handle Google Gemini 2.5 Flash direct integration
  if (modelKey === 'gemini25Flash') {
    console.log(`[Model Service] Routing message generation to Google Gemini API (key: ${modelKey})`);
    const stream = await generateStream(messages, {
      signal,
      model: 'gemini-2.5-flash',
      systemInstruction: processedSystemInstruction
    });

    return (async function* () {
      for await (const chunk of stream) {
        if (chunk.text) {
          yield { text: chunk.text };
        }
      }
    })();
  }



  // Handle Groq API model (GPT OSS 120B)
  if (modelKey === 'gptOss120b') {
    const modelId = 'openai/gpt-oss-120b';
    console.log(`[Model Service] Routing message generation to Groq API (key: ${modelKey}, model: ${modelId})`);

    const apiMessages = [];
    if (systemInstruction && systemInstruction.trim()) {
      apiMessages.push({ role: 'system', content: systemInstruction.trim() });
    }
    for (const msg of messages) {
      apiMessages.push({
        role: msg.role === 'assistant' || msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content
      });
    }

    const response = await generateGroqStream(apiMessages, {
      model: modelId,
      signal
    });
    return parseSSEStream(response, signal);
  }

  // Prepend conversational guidelines for Llama 3.3 70B to avoid generic/repetitive greeting statements
  let adjustedSystemInstruction = systemInstruction;
  if (modelKey === 'llama70b') {
    adjustedSystemInstruction = `You are Kaizen AI, a highly personalized, natural, engaging, and intelligent AI companion. Your goal is to make conversations feel organic, lively, and intelligent. Avoid generic, dry, or repetitive remarks. Never tell the user that they are repeating greetings (like saying "hello again") or sound robotic. Be direct, helpful, and converse naturally.\n\n` + (systemInstruction || '');
  }

  // 1. Resolve to the fully qualified NVIDIA model ID
  const resolvedModelId = resolveModel(modelKey);
  console.log(`[Model Service] Routing message generation to model: ${resolvedModelId} (key: ${modelKey})`);

  // 2. Format messages into OpenAI compatible structures
  const apiMessages = [];
  
  if (adjustedSystemInstruction && adjustedSystemInstruction.trim()) {
    apiMessages.push({
      role: 'system',
      content: adjustedSystemInstruction.trim()
    });
  }

  // Prepend history mapping 'assistant' and 'user' roles
  for (const msg of messages) {
    apiMessages.push({
      role: msg.role === 'assistant' || msg.role === 'model' ? 'assistant' : 'user',
      content: msg.content
    });
  }

  // 3. Request completion stream from NVIDIA Build API provider
  const response = await generateNVIDIAStream(apiMessages, {
    model: resolvedModelId,
    signal
  });

  // 4. Return the parsed SSE async generator
  return parseSSEStream(response, signal);
};
