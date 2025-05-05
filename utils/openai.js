// utils/openai.js
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateResume(jsonData) {
  const prompt = `Generate a clean, professional resume based on the following data:\n\n${jsonData}\n\nFormat it using consistent headings, bullet points, and concise descriptions. No cover letter, only the resume content.`;

  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1200,
  });

  return chatCompletion.choices[0].message.content;
}

module.exports = { generateResume };
