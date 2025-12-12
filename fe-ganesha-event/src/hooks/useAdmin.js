import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import toast from 'react-hot-toast';

// 1. Manage Events
export const useAdminEvents = (search = '') => {
  return useQuery({
    queryKey: ['admin-events', search],
    queryFn: async () => {
      const response = await api.get(`/events?search=${search}&admin=true`);
      return response.data;
    },
    keepPreviousData: true,
  });
};

// 2. Manage Registrations
export const useAdminRegistrations = (eventId) => {
    return useQuery({
        queryKey: ['admin-registrations', eventId],
        queryFn: async () => {
            if (!eventId) return [];
            const response = await api.get(`/events/${eventId}/registrations`);
            return response.data;
        },
        enabled: !!eventId, // Only fetch if eventId is selected
    });
};

// 3. Attendance
export const useAdminAttendance = (eventId) => {
    return useQuery({
        queryKey: ['admin-attendance', eventId],
        queryFn: async () => {
            if (!eventId) return [];
            // Reusing registrations endpoint but filtering for attended might be better on backend
            // For now, let's assume we fetch all and filter client side or usage specific endpoint
            const response = await api.get(`/events/${eventId}/registrations`); 
            return response.data;
        },
        enabled: !!eventId,
    });
};

// Mutations
export const useDeleteEvent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await api.delete(`/events/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-events']);
            toast.success('Event berhasil dihapus');
        },
        onError: () => {
            toast.error('Gagal menghapus event');
        }
    });
};
