import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoChatbubbleEllipses, IoClose, IoSend, IoSparkles } from 'react-icons/io5';
import aiService from '../services/aiService';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Hello! I'm your LexConnect AI Legal Assistant. How can I help you today? You can ask me legal questions or describe your situation, and I'll suggest the right type of lawyer if needed.",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = { role: 'user', text: message, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Format history for Gemini - ensure it starts with a 'user' message
      const history = messages
        .filter((msg, index) => !(index === 0 && msg.role === 'model')) // Skip initial AI greeting
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

      const response = await aiService.sendMessage(userMessage.text, history);
      
      const aiResponse = {
        role: 'model',
        text: response.data,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "What lawyer do I need for a property dispute?",
    "How do I start a small business?",
    "Can you explain what a 'Will' is?",
    "Help me with a family matter."
  ];

  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="chat-window mb-4 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                  <IoSparkles className="text-xl" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg leading-tight">LexConnect AI</h3>
                  <p className="text-xs text-primary-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Online Legal Assistant
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <IoClose className="text-2xl" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 backdrop-blur-sm">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-primary-600 text-white rounded-tr-none shadow-md' 
                        : 'bg-white text-slate-800 rounded-tl-none shadow-sm border border-slate-100'
                    } ${msg.isError ? 'border-red-200 bg-red-50 text-red-700' : ''}`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <span className={`text-[10px] mt-1 block opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions (only at start or when empty) */}
            {messages.length < 3 && !isLoading && (
              <div className="px-4 py-2 flex flex-wrap gap-2 bg-slate-50/50">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(s)}
                    className="text-xs py-1.5 px-3 bg-white border border-slate-200 rounded-full text-slate-600 hover:border-primary-400 hover:text-primary-600 transition-all shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-100 border-none rounded-full py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all outline-none"
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  message.trim() && !isLoading 
                    ? 'bg-primary-600 text-white shadow-lg hover:scale-105 active:scale-95' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <IoSend className="ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-primary-600 to-primary-500 text-white rounded-full flex items-center justify-center shadow-premium-hover relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        {isOpen ? (
          <IoClose className="text-3xl relative z-10" />
        ) : (
          <IoChatbubbleEllipses className="text-3xl relative z-10" />
        )}
        
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-accent-500 border-2 border-white"></span>
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default ChatBot;
