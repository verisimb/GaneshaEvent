import React, { useState, useEffect } from 'react';
import { Users, Search, Calendar, MapPin, ArrowLeft, Check, X, Eye } from 'lucide-react';
import api from '../../lib/axios';

export const ManageRegistrationsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [search, setSearch] = useState('');

  // Modal for Payment Proof
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [search]);

  useEffect(() => {
    if (selectedEvent) {
      fetchRegistrations(selectedEvent.id);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events?search=${search}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (eventId) => {
    try {
      setLoadingRegs(true);
      const response = await api.get(`/events/${eventId}/tickets`);
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      alert('Gagal mengambil data pendaftar');
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    if (!window.confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`)) return;

    try {
      await api.put(`/tickets/${ticketId}/status`, { status: newStatus });
      // Refresh list
      fetchRegistrations(selectedEvent.id);
      alert('Status berhasil diperbarui');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal memperbarui status');
    }
  };

  // View: Event List
  const renderEventList = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari event..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => setSelectedEvent(event)}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
          >
            <div className="h-40 bg-gray-100 relative overflow-hidden">
              <img
                src={event.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // View: Registrations Table
  const renderRegistrationList = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
        <button
          onClick={() => setSelectedEvent(null)}
          className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h2>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <Calendar className="w-3 h-3" /> {new Date(selectedEvent.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Nama Peserta</th>
              <th className="px-6 py-4 font-semibold">Tgl Daftar</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold text-center">Bukti Bayar</th>
              <th className="px-6 py-4 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loadingRegs ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">Memuat data...</td></tr>
            ) : registrations.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">Belum ada pendaftar pada event ini.</td></tr>
            ) : (
              registrations.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{ticket.user?.name || 'User ' + ticket.user_id}</div>
                    <div className="text-xs text-gray-500">{ticket.user?.email || 'test@example.com'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold
                      ${ticket.status === 'dikonfirmasi' ? 'bg-green-100 text-green-700' :
                        ticket.status === 'ditolak' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'}`}>
                      {ticket.status === 'dikonfirmasi' ? 'Confirmed' :
                        ticket.status === 'ditolak' ? 'Rejected' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {selectedEvent.price > 0 ? (
                      ticket.payment_proof ? (
                        <button
                          onClick={() => setPreviewImage(ticket.payment_proof)}
                          className="text-primary hover:text-primary/80 font-medium text-sm inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> Lihat
                        </button>
                      ) : <span className="text-gray-400 text-xs italic">Tidak ada</span>
                    ) : (
                      <span className="text-gray-400 text-xs">Gratis</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {ticket.status === 'menunggu_konfirmasi' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'dikonfirmasi')}
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Konfirmasi"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(ticket.id, 'ditolak')}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Tolak"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {ticket.status !== 'menunggu_konfirmasi' && (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Users className="text-primary" />
        Kelola Pendaftar
      </h1>

      {selectedEvent ? renderRegistrationList() : renderEventList()}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <img src={previewImage} alt="Bukti Bayar" className="w-full rounded-lg shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};
