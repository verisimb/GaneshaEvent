import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export const useEvents = (search = '') => {
  return useQuery({
    queryKey: ['events', search],
    queryFn: async () => {
      const response = await api.get(`/events?search=${search}`);
      // Filter out completed events on the client side if needed, 
      // or rely on backend. Currently backend sends all, so we filter here.
      // Ideally optimized backend endpoint is better, but this works for now.
      return response.data.filter(e => !e.is_completed || e.is_completed == 0);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    keepPreviousData: true,
  });
};

export const useEvent = (id) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await api.get(`/events/${id}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
};
