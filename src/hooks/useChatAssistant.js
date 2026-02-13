import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import chatAssistantService from '../services/chatAssistantService'; // Default import

export const useChatAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isAIMode, setIsAIMode] = useState(true);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Initialize with welcome message
  useEffect(() => {
    if (user) {
      const welcomeMessage = {
        id: 1,
        text: `Hello! I'm your AI booking assistant. How can I help you today?`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAI: true
      };
      setMessages([welcomeMessage]);
    }
  }, [user]);

  const sendMessage = useCallback(async (text, file = null) => {
    if (!text.trim() && !file) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: text || `Uploaded file: ${file?.name}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasFile: !!file
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      let response;
      if (file) {
        response = await chatAssistantService.uploadDocument(file, language);
      } else {
        response = await chatAssistantService.sendMessage(text, language, {
          userId: user?.id,
          isAIMode,
          previousMessages: conversationHistory.slice(-5)
        });
      }

      const aiResponse = {
        id: messages.length + 2,
        text: response.response || 'I received your message. How can I assist you further?',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAI: isAIMode,
        suggestions: response.suggestions
      };

      setMessages(prev => [...prev, aiResponse]);
      
      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { 
          user: text, 
          ai: aiResponse.text, 
          timestamp: new Date().toISOString(),
          language,
          isAIMode 
        }
      ]);

    } catch (error) {
      console.error('Error in chat:', error);
      
      const errorMessage = {
        id: messages.length + 2,
        text: 'Sorry, I encountered an error. Please try again or switch to human support.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAI: false,
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [messages, language, isAIMode, conversationHistory, user?.id]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationHistory([]);
  }, []);

  const getChatSummary = useCallback(() => {
    if (conversationHistory.length === 0) return null;
    
    return {
      totalMessages: conversationHistory.length,
      lastActive: new Date(conversationHistory[conversationHistory.length - 1].timestamp).toLocaleTimeString(),
      languagesUsed: [...new Set(conversationHistory.map(c => c.language))],
      aiResponses: conversationHistory.filter(c => c.isAIMode).length
    };
  }, [conversationHistory]);

  const switchToHuman = useCallback(async () => {
    if (!user?.id) return;
    
    setIsAIMode(false);
    
    const switchMessage = {
      id: messages.length + 1,
      text: 'Connecting you with a human agent...',
      sender: 'system',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, switchMessage]);
    
    try {
      const response = await chatAssistantService.switchToHuman(user.id, conversationHistory);
      
      const humanMessage = {
        id: messages.length + 2,
        text: `Hello! This is ${response.agentName || 'Sarah'}, your human support agent. How can I assist you today?`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isAI: false,
        agentName: response.agentName || 'Sarah'
      };
      
      setMessages(prev => [...prev, humanMessage]);
    } catch (error) {
      console.error('Failed to switch to human:', error);
      
      const errorMessage = {
        id: messages.length + 2,
        text: 'Unable to connect to human agent. Please try again later.',
        sender: 'system',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsAIMode(true); // Revert to AI mode
    }
  }, [messages.length, conversationHistory, user?.id]);

  return {
    messages,
    loading,
    language,
    setLanguage,
    isAIMode,
    setIsAIMode,
    sendMessage,
    clearChat,
    getChatSummary,
    switchToHuman,
    conversationHistory
  };
};