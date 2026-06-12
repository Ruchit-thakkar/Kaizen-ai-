/**
 * Parse a Server-Sent Events (SSE) stream and yield content deltas.
 * Supports both web-standard ReadableStream and Node.js Streams.
 * @param {Response} response - The HTTP Response object from fetch
 * @param {AbortSignal} [signal] - Optional AbortSignal to stop parsing
 * @returns {AsyncGenerator<{text: string}>} Async generator yielding chunks of text
 */
export async function* parseSSEStream(response, signal) {
  const body = response.body;
  if (!body) return;

  const decoder = new TextDecoder('utf-8');
  let hasReasoning = false;
  let transitionDone = false;

  // Case 1: Web-standard ReadableStream (using getReader)
  if (typeof body.getReader === 'function') {
    const reader = body.getReader();
    let buffer = '';

    try {
      while (true) {
        if (signal?.aborted) break;

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          
          if (trimmed === 'data: [DONE]') {
            return;
          }

          if (trimmed.startsWith('data: ')) {
            try {
              const dataStr = trimmed.slice(6);
              const json = JSON.parse(dataStr);
              const delta = json.choices?.[0]?.delta;
              if (delta) {
                const content = delta.content || '';
                const reasoning = delta.reasoning_content || delta.reasoning || '';
                if (reasoning) {
                  hasReasoning = true;
                  yield { text: reasoning };
                } else if (content) {
                  if (hasReasoning && !transitionDone) {
                    transitionDone = true;
                    yield { text: '\n\n' };
                  }
                  yield { text: content };
                }
              }
            } catch (err) {
              // Ignore partial chunk JSON parse errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } else {
    // Case 2: Node.js Readable Stream (async iterator)
    let buffer = '';

    for await (const chunk of body) {
      if (signal?.aborted) break;

      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed === 'data: [DONE]') {
          return;
        }

        if (trimmed.startsWith('data: ')) {
          try {
            const dataStr = trimmed.slice(6);
            const json = JSON.parse(dataStr);
            const delta = json.choices?.[0]?.delta;
            if (delta) {
              const content = delta.content || '';
              const reasoning = delta.reasoning_content || delta.reasoning || '';
              if (reasoning) {
                hasReasoning = true;
                yield { text: reasoning };
              } else if (content) {
                if (hasReasoning && !transitionDone) {
                  transitionDone = true;
                  yield { text: '\n\n' };
                }
                yield { text: content };
              }
            }
          } catch (err) {
            // Ignore partial chunk JSON parse errors
          }
        }
      }
    }
  }
}
