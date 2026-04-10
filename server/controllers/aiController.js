const asyncHandler = require('express-async-handler');
const genAI = require('../config/openai'); // Still points to config/openai.js (now uses Gemini inside)

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Ask AI a study-related question
// @route   POST /api/ai/ask
// @access  Private (student)
// ─────────────────────────────────────────────────────────────────────────────
const askAI = asyncHandler(async (req, res) => {
  const { question, history = [] } = req.body;

  if (!question || question.trim().length === 0) {
    res.status(400);
    throw new Error('Question is required');
  }

  // System instruction for Gemini
  const systemInstruction = `You are Student Buddy AI — a helpful, friendly academic assistant for students.
You help students understand concepts, solve problems, explain topics clearly, and guide their learning.
Keep answers concise but thorough. Use examples where helpful. Format code/math using markdown.
Only answer study-related questions. If asked something off-topic, politely redirect to academics.`;

  // Get Gemini 1.5 Flash model (free tier, fast)
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction,
  });

  // Build chat history in Gemini format (role: 'user' | 'model')
  const chatHistory = history.slice(-10).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // Start a chat session with history
  const chat = model.startChat({ history: chatHistory });

  // Send the new question
  const result = await chat.sendMessage(question.trim());
  const answer = result.response.text();

  res.status(200).json({
    success: true,
    data: {
      question: question.trim(),
      answer,
      model: 'gemini-1.5-flash',
    },
  });
});

module.exports = { askAI };
