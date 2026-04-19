import api from './api';

/**
 * Service to handle AI chatbot interactions
 */
const aiService = {
  /**
   * Send a message to the AI chatbot
   * @param {string} message - The user's message
   * @param {Array} history - Array of previous messages [{role: 'user', parts: [{text: '...'}]}, {role: 'model', parts: [{text: '...'}]}]
   * @returns {Promise<Object>} - The AI response
   */
  async sendMessage(message, history = []) {
    try {
      const response = await api.post('/ai/chat', { message, history });
      return response.data;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw error.response?.data || { message: 'Failed to connect to AI' };
    }
  }
};

export default aiService;
