// src/hooks/useEventRequest.js
import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import eventRequestService from '../services/eventRequestService';

export const useEventRequest = () => {
  const { user, loading: authLoading } = useAuth(); // Add authLoading
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // AI response states
  const [entities, setEntities] = useState(null);
  const [organizerMatches, setOrganizerMatches] = useState([]);
  const [budgetAnalysis, setBudgetAnalysis] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  // Clear all states
  const clearAllStates = useCallback(() => {
    setEntities(null);
    setOrganizerMatches([]);
    setBudgetAnalysis(null);
    setAiSuggestions(null);
    setError(null);
  }, []);

  // Process natural language request with AI
  const processRequest = useCallback(async (naturalLanguageRequest) => {
    console.log('🔍 processRequest called with:', { 
      userId: user?.id, 
      authLoading,
      text: naturalLanguageRequest 
    });

    // Check if auth is still loading
    if (authLoading) {
      console.log('⏳ Auth still loading, please wait');
      setError('Authentication is still loading. Please wait.');
      return { 
        success: false, 
        error: 'Authentication is still loading. Please wait.' 
      };
    }

    // Check if user exists
    if (!user) {
      console.error('❌ No user object found');
      setError('User not authenticated - Please log in');
      return { 
        success: false, 
        error: 'User not authenticated - Please log in' 
      };
    }

    if (!user.id) {
      console.error('❌ User has no ID:', user);
      setError('User ID not found - Please log in again');
      return { 
        success: false, 
        error: 'User ID not found - Please log in again' 
      };
    }

    if (!naturalLanguageRequest?.trim()) {
      setError('Please enter a request');
      return { success: false, error: 'Please enter a request' };
    }

    setLoading(true);
    setError(null);
    clearAllStates();

    try {
      console.log('🚀 Hook: Processing request for user:', user.id);
      console.log('📝 Hook: Request text:', naturalLanguageRequest);
      
      const result = await eventRequestService.processNaturalLanguageRequest(
        naturalLanguageRequest,
        user.id
      );
      
      console.log('📦 Hook: Received result:', result);
      
      // IMPORTANT: Update all states with the result
      if (result?.success) {
        // Set entities if they exist
        if (result.entities) {
          setEntities(result.entities);
        }
        
        // Set organizers if they exist
        if (result.organizers && result.organizers.length > 0) {
          console.log('✅ Hook: Setting', result.organizers.length, 'organizers');
          setOrganizerMatches(result.organizers);
        } else {
          console.log('⚠️ Hook: No organizers in result');
          setOrganizerMatches([]);
        }
        
        // Set budget analysis if it exists
        if (result.budgetAnalysis) {
          setBudgetAnalysis(result.budgetAnalysis);
        }
        
        // Set suggestions if they exist
        if (result.suggestions) {
          setAiSuggestions(result.suggestions);
        }
        
        // Save to history
        const newRequest = {
          id: result.requestId || Date.now().toString(),
          text: naturalLanguageRequest,
          entities: result.entities,
          organizers: result.organizers || [],
          budgetAnalysis: result.budgetAnalysis,
          suggestions: result.suggestions,
          timestamp: new Date().toISOString(),
          status: 'processed'
        };
        
        setRequests(prev => [newRequest, ...prev]);
        
        // Return the complete result with all data
        return {
          success: true,
          entities: result.entities,
          organizers: result.organizers || [],
          budgetAnalysis: result.budgetAnalysis,
          suggestions: result.suggestions,
          requestId: newRequest.id
        };
      } else {
        // Return success false but with any partial data
        return { 
          success: false, 
          error: result?.error || 'Unknown error',
          entities: result?.entities || null
        };
      }
      
    } catch (error) {
      console.error('❌ Hook: Error in processRequest:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, clearAllStates]); // Add authLoading to dependencies

  // Return all the values and functions
  return {
    // Main function
    processRequest,
    
    // AI results - these will update in real-time
    entities,
    organizerMatches,
    budgetAnalysis,
    aiSuggestions,
    
    // Status
    loading,
    error,
    
    // History
    requests,
    
    // Other utilities
    clearResults: clearAllStates,
  };
};