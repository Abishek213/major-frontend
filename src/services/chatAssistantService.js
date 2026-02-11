import api from '../utils/api';

class ChatAssistantService {
  async sendMessage(message, language = 'en', context = null, file = null) {
    try {
      if (file) {
        const formData = new FormData();
        formData.append('message', message);
        formData.append('language', language);
        
        if (context) {
          formData.append('context', JSON.stringify(context));
        }
        
        formData.append('file', file);

        const response = await api.safePost('/ai/chat', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        const response = await api.safePost('/ai/chat', {
          message,
          language,
          context
        });
        return response.data;
      }
    } catch (error) {
      console.error('Chat service error:', error);
      
      // Return mock response for development
      if (import.meta.env.MODE === 'development') {
        return this.getMockResponse(message, language);
      }
      
      throw error;
    }
  }

  async switchToHuman(userId, conversationHistory) {
    try {
      const response = await api.safePost('/ai/chat/switch-to-human', {
        userId,
        conversationHistory
      });
      return response.data;
    } catch (error) {
      console.error('Switch to human error:', error);
      
      // Mock response for development
      if (import.meta.env.MODE === 'development') {
        return {
          success: true,
          agentName: 'Sarah',
          estimatedWaitTime: '1 minute'
        };
      }
      
      throw error;
    }
  }

  async getFAQs(query = '', category = 'all', language = 'en') {
    try {
      const response = await api.safeGet('/ai/faq', {
        params: { query, category, language }
      });
      return response.data;
    } catch (error) {
      console.error('FAQ service error:', error);
      
      // Mock FAQs for development
      if (import.meta.env.MODE === 'development') {
        return this.getMockFAQs();
      }
      
      throw error;
    }
  }

  async uploadDocument(file, language = 'en') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);

      const response = await api.safePost('/ai/chat/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }

  async getSupportedLanguages() {
    try {
      const response = await api.safeGet('/ai/languages');
      return response.data;
    } catch (error) {
      console.error('Languages error:', error);
      
      // Mock languages for development
      if (import.meta.env.MODE === 'development') {
        return [
          { code: 'en', name: 'English', flag: '🇺🇸' },
          { code: 'es', name: 'Español', flag: '🇪🇸' },
          { code: 'fr', name: 'Français', flag: '🇫🇷' },
          { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
          { code: 'ne', name: 'नेपाली', flag: '🇳🇵' }
        ];
      }
      
      throw error;
    }
  }

  // Mock responses for development
  getMockResponse(message, language = 'en') {
    const responses = {
      en: `I understand you're asking about "${message}". Based on our FAQ database, here's what I found...`,
      es: `Entiendo que estás preguntando sobre "${message}". Según nuestra base de datos de preguntas frecuentes, esto es lo que encontré...`,
      fr: `Je comprends que vous demandez à propos de "${message}". Sur la base de notre base de données FAQ, voici ce que j'ai trouvé...`
    };
    
    return {
      response: responses[language] || responses.en,
      suggestions: ['Related FAQ found', 'Booking policy applies', 'Contact support for more details'],
      confidence: 0.85
    };
  }

  getMockFAQs() {
    return [
      {
        id: 1,
        question: "How do I book an event?",
        answer: "To book an event, navigate to the event page and click the 'Book Now' button.",
        category: 'booking',
        views: 1245
      },
      {
        id: 2,
        question: "What's your cancellation policy?",
        answer: "Cancellations are accepted up to 48 hours before the event.",
        category: 'payment',
        views: 892
      }
    ];
  }
}

export default new ChatAssistantService();