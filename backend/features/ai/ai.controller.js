/**
 * Fetch list of supported models in the assistant app.
 */
export const getAvailableModels = async (req, res) => {
  res.status(200).json({
    success: true,
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', type: 'Fast & responsive text generation' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', type: 'Advanced reasoning and complex analysis' }
    ]
  });
};
