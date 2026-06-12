import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const apiKey = process.env.DEEPSEEK_API_KEY;

const openai = new OpenAI({
  apiKey,
  baseURL: 'https://api.deepseek.com'
});

async function run() {
  try {
    const stream = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Say hello' }],
      stream: true
    });
    for await (const chunk of stream) {
      console.log(chunk);
    }
  } catch (error) {
    console.log('--- ERROR DETAILS ---');
    console.log('Status Code:', error.status);
    console.log('Error Message:', error.message);
    console.log('Error Body (error.error):', JSON.stringify(error.error, null, 2));
    console.log('Error Keys:', Object.keys(error));
  }
}

run();
