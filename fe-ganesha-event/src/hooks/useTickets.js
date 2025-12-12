import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export const useMyTickets = () => {
  return useQuery({
    queryKey: ['my-tickets'],
    queryFn: async () => {
      const response = await api.get('/my-tickets');
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true,
  });
};

export const useMyCertificates = () => {
    return useQuery({
      queryKey: ['my-certificates'],
      queryFn: async () => {
        const response = await api.get('/my-tickets');
        return response.data;
      },
      select: (tickets) => tickets.filter(ticket => 
        ticket.event && ticket.is_attended && ticket.event.is_completed && ticket.status === 'dikonfirmasi'
      ),
      staleTime: 1000 * 60 * 5,
    });
  };
