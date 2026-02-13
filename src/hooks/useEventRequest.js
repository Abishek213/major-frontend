import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import eventRequestService from '../services/eventRequestService'; // Default import

export const useEventRequest = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState(null);
  const [organizerMatches, setOrganizerMatches] = useState([]);

  const processRequest = useCallback(async (naturalLanguageRequest) => {
    if (!user?.id || !naturalLanguageRequest.trim()) return;

    setLoading(true);
    setEntities(null);
    setOrganizerMatches([]);

    try {
      const result = await eventRequestService.processNaturalLanguageRequest(
        naturalLanguageRequest,
        user.id,
        { timestamp: new Date().toISOString() }
      );

      setEntities(result.entities);
      setOrganizerMatches(result.organizers);

      // Save request to history
      const newRequest = {
        id: result.requestId || Date.now().toString(),
        text: naturalLanguageRequest,
        entities: result.entities,
        organizers: result.organizers,
        timestamp: result.timestamp || new Date().toISOString(),
        status: 'processed'
      };

      setRequests(prev => [newRequest, ...prev]);

      return {
        entities: result.entities,
        organizers: result.organizers,
        requestId: newRequest.id
      };

    } catch (error) {
      console.error('Error processing request:', error);
      
      // For development, use mock processing
      if (import.meta.env.MODE === 'development') {
        const mockEntities = eventRequestService.getMockEntities(naturalLanguageRequest);
        const mockOrganizers = eventRequestService.getMockOrganizers();
        
        setEntities(mockEntities);
        setOrganizerMatches(mockOrganizers);
        
        const newRequest = {
          id: Date.now().toString(),
          text: naturalLanguageRequest,
          entities: mockEntities,
          organizers: mockOrganizers,
          timestamp: new Date().toISOString(),
          status: 'processed'
        };
        
        setRequests(prev => [newRequest, ...prev]);
        
        return {
          entities: mockEntities,
          organizers: mockOrganizers,
          requestId: newRequest.id
        };
      }
      
      throw new Error('Failed to process request. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const extractEntities = useCallback(async (text) => {
    try {
      const result = await eventRequestService.extractEntities(text);
      return result;
    } catch (error) {
      console.error('Error extracting entities:', error);
      if (import.meta.env.MODE === 'development') {
        return eventRequestService.getMockEntities(text);
      }
      throw error;
    }
  }, []);

  const findMatchingOrganizers = useCallback(async (criteria) => {
    try {
      const result = await eventRequestService.findMatchingOrganizers(criteria);
      return result;
    } catch (error) {
      console.error('Error finding matching organizers:', error);
      if (import.meta.env.MODE === 'development') {
        return eventRequestService.getMockOrganizers();
      }
      throw error;
    }
  }, []);

  const getRequestHistory = useCallback(() => {
    return requests.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [requests]);

  const getRequestStats = useCallback(() => {
    if (requests.length === 0) return null;

    const eventTypes = {};
    const locations = {};
    let totalBudget = 0;
    let totalAttendees = 0;
    
    requests.forEach(req => {
      const type = req.entities.eventType;
      const location = req.entities.location;
      const budget = req.entities.budget;
      const attendees = req.entities.attendees;
      
      eventTypes[type] = (eventTypes[type] || 0) + 1;
      locations[location] = (locations[location] || 0) + 1;
      
      if (budget && budget !== 'Not specified' && budget !== 'Free') {
        const budgetValue = parseInt(budget.replace(/[^0-9]/g, '')) || 0;
        totalBudget += budgetValue;
      }
      
      if (attendees && attendees !== 'Not specified') {
        const attendeesValue = parseInt(attendees.replace(/[^0-9]/g, '')) || 50;
        totalAttendees += attendeesValue;
      }
    });

    return {
      totalRequests: requests.length,
      mostCommonType: Object.keys(eventTypes).reduce((a, b) => 
        eventTypes[a] > eventTypes[b] ? a : b, 'Various'),
      mostCommonLocation: Object.keys(locations).reduce((a, b) => 
        locations[a] > locations[b] ? a : b, 'Various'),
      avgOrganizerMatches: requests.reduce((acc, req) => 
        acc + (req.organizers?.length || 0), 0) / requests.length,
      avgBudget: requests.length > 0 ? Math.round(totalBudget / requests.length) : 0,
      avgAttendees: requests.length > 0 ? Math.round(totalAttendees / requests.length) : 0
    };
  }, [requests]);

  const clearHistory = useCallback(() => {
    setRequests([]);
    setEntities(null);
    setOrganizerMatches([]);
  }, []);

  return {
    processRequest,
    extractEntities,
    findMatchingOrganizers,
    requests: getRequestHistory(),
    loading,
    entities,
    organizerMatches,
    getRequestStats,
    clearHistory
  };
};