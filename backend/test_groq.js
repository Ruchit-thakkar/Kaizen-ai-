import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GROQ_API_KEY;
console.log('GROQ_API_KEY:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Missing');

async function testModel(modelId) {
  console.log(`\n--- Testing model: ${modelId} ---`);
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'Say hello in 3 words' }],
        stream: false,
        temperature: 0.2,
        top_p: 0.7,
        max_tokens: 50
      })
    });

    console.log('Status:', response.status, response.statusText);
    const text = await response.text();
    console.log('Response body:', text);
  } catch (err) {
    console.error('Error querying API:', err);
  }
}

async function runTests() {
  await testModel('openai/gpt-oss-120b');
}

runTests();
