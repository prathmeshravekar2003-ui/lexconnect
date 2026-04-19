const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * @desc    Get AI completion for legal queries
 * @route   POST /api/ai/chat
 * @access  Public (or Private if middleware added)
 */
const getChatResponse = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key') {
      console.error("❌ AI Error: GEMINI_API_KEY is missing or invalid in .env file");
      return res.status(500).json({ 
        success: false, 
        message: "AI configuration missing. Please add a valid GEMINI_API_KEY to the backend .env file." 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest"
    });

    // If history is provided, ensure it starts with 'user' and alternates correctly
    let chatHistory = [];
    if (history && history.length > 0) {
      // Filter out any messages that aren't 'user' or 'model' and ensure it starts with 'user'
      chatHistory = history.filter(item => item.role === 'user' || item.role === 'model');
      
      // If the first message is 'model', remove it (Gemini requirement)
      if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
        chatHistory.shift();
      }
    }

    const chat = model.startChat({
      history: chatHistory,
    });

    // Construct the prompt with system instructions embedded if no history
    const systemPrompt = `You are the LexConnect AI Legal Assistant, a professional AI integrated into the LexConnect platform. 
    Your goals:
    1. Answer legal queries concisely.
    2. Suggest lawyer types: Criminal, Family, Corporate, Civil, Tax, Property, Labour, Immigration, Intellectual Property, Environmental, Constitutional, Banking, Cyber, Consumer Protection.
    Disclaimer: "I am an AI assistant and provide general information. For professional legal advice, please consult a qualified lawyer."
    User Query: `;

    const finalMessage = chatHistory.length === 0 ? systemPrompt + message : message;

    const result = await chat.sendMessage(finalMessage);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({
      success: true,
      data: text
    });
  } catch (error) {
    console.error("AI Controller Error:", error);
    
    // Check for specific API key errors
    if (error.message && error.message.includes('API_KEY_INVALID')) {
       return res.status(401).json({
        success: false,
        message: "Invalid Gemini API Key. Please check your .env file."
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to get AI response",
      error: error.message
    });
  }
};

module.exports = {
  getChatResponse
};
