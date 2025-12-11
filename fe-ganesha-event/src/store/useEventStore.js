import { create } from 'zustand';
import api from '../lib/axios';

const getUserFromStorage = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
};

export const useEventStore = create((set, get) => ({
  user: getUserFromStorage(),
  token: localStorage.getItem('token') || null,
  events: [],
  tickets: [],
  isLoading: false,
  error: null,

  // Auth Actions
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/login', { email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isLoading: false });
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Login failed' 
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/register', userData);
      // const { user, token } = response.data; // Don't auto-login
      
      // localStorage.setItem('token', token);
      // localStorage.setItem('user', JSON.stringify(user));
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Registration failed' 
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, tickets: [] });
    }
  },

  // Event Actions
  fetchEvents: async (search = '') => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/events?search=${search}`);
      const validEvents = response.data.filter(e => !e.is_completed || e.is_completed == 0);
      set({ events: validEvents, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to fetch events' });
    }
  },

  getEventById: async (id) => {
    // Try to find in cache first
    const event = get().events.find(e => e.id == id);
    if (event) return event;

    // Otherwise fetch
    try {
      const response = await api.get(`/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch event', error);
      return null;
    }
  },

  // Ticket Actions
  fetchMyTickets: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/my-tickets');
      set({ tickets: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: 'Failed to fetch tickets' });
    }
  },

  registerEvent: async (eventId, paymentProof) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('event_id', eventId);
      if (paymentProof) {
        formData.append('payment_proof', paymentProof);
      }

      await api.post('/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await get().fetchMyTickets(); // Refresh tickets
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error.response?.data?.message || 'Registration failed' 
      });
      return false;
    }
  },
}));
