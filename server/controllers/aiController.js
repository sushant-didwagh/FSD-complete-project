const asyncHandler = require('express-async-handler');
const openai = require('../config/openai');

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

  // Build messages array for OpenAI
  const systemMessage = {
    role: 'system',
    content: `You are Student Buddy AI — a helpful, friendly academic assistant for students.
You help students understand concepts, solve problems, explain topics clearly, and guide their learning.
Keep answers concise but thorough. Use examples where helpful. Format code/math using markdown.
Only answer study-related questions. If asked something off-topic, politely redirect to academics.`,
  };

  // Include last 10 messages of history for context
  const contextMessages = history.slice(-10).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [systemMessage, ...contextMessages, { role: 'user', content: question.trim() }],
    max_tokens: 1000,
    temperature: 0.7,
  });

  const answer = completion.choices[0].message.content;

  res.status(200).json({
    success: true,
    data: {
      question: question.trim(),
      answer,
      model: completion.model,
    },
  });
});

module.exports = { askAI };
