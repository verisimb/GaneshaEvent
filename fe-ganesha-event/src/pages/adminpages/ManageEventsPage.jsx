import React, { useState, useEffect } from 'react';
import { Calendar, Plus, MapPin, Search, Edit, Trash, X, Upload, DollarSign, Image as ImageIcon, ExternalLink, QrCode, CheckCircle, FileText } from 'lucide-react';
import api from '../../lib/axios';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

export const ManageEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    organizer: '',
    price: 0,
    isPaid: false, // UI helper state
    bank_name: '',
    account_number: '',
    account_holder: '',
    certificate_template: null,
    is_completed: false,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [search]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events?search=${search}&admin=true`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Gagal mengambil data event');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      organizer: '',
      price: 0,
      isPaid: false,
      bank_name: '',
      account_number: '',
      account_holder: '',
      certificate_template: null,
      is_completed: false,
      image: null
    });
    setImagePreview(null);
    setCurrentEvent(null);
    setIsEditing(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event) => {
    setCurrentEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      organizer: event.organizer,
      price: event.price,
      isPaid: event.price > 0,
      bank_name: event.bank_name || '',
      account_number: event.account_number || '',
      account_holder: event.account_holder || '',
      certificate_template: null, 
      is_completed: event.is_completed || false,
      image: null // Don't verify old file, just allow new upload
    });
    setImagePreview(event.image_url);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Event yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'rounded-2xl',
        confirmButton: 'font-bold px-6 py-2 rounded-xl',
        cancelButton: 'px-6 py-2 rounded-xl'
      }
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/events/${id}`);
        fetchEvents();
        toast.success('Event berhasil dihapus');
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Gagal menghapus event');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: If Paid, ensure Price > 0
    if (formData.isPaid && formData.price <= 0) {
      toast.error('Harga harus lebih dari 0 untuk event berbayar');
      return;
    }

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('description', formData.description);
    payload.append('date', formData.date);
    payload.append('time', formData.time);
    payload.append('location', formData.location);
    payload.append('organizer', formData.organizer);
    payload.append('price', formData.isPaid ? formData.price : 0);

    if (formData.isPaid) {
      payload.append('bank_name', formData.bank_name);
      payload.append('account_number', formData.account_number);
      payload.append('account_holder', formData.account_holder);
    } else {
      // Clear bank info if switched to free
      payload.append('bank_name', '');
      payload.append('account_number', '');
      payload.append('account_holder', '');
    }

    if (formData.certificate_template) {
      payload.append('certificate_template', formData.certificate_template);
    }
    
    // Status completion handling
    payload.append('is_completed', formData.is_completed ? 1 : 0);

    if (formData.image) {
      payload.append('image', formData.image);
    }

    try {
      if (isEditing) {
        // Method spoofing for Laravel PUT with FormData
        payload.append('_method', 'PUT');
        await api.post(`/events/${currentEvent.id}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Event berhasil diperbarui');
      } else {
        await api.post('/events', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Event berhasil dibuat');
      }
      setIsModalOpen(false);
      fetchEvents();
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Terjadi kesalahan saat menyimpan event');
    }
  };

  const handleCompleteEvent = async (event) => {
      const result = await Swal.fire({
        title: 'Selesaikan Event?',
        text: `Tandai event "${event.title}" sebagai Selesai? Sertifikat akan dapat didownload oleh peserta.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#6C1022',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Selesaikan!',
        cancelButtonText: 'Batal',
        customClass: {
          popup: 'rounded-2xl',
          confirmButton: 'font-bold px-6 py-2 rounded-xl',
          cancelButton: 'px-6 py-2 rounded-xl'
        }
      });

      if (result.isConfirmed) {
          try {
              const payload = new FormData();
              payload.append('_method', 'PUT');
              payload.append('is_completed', 1);
              
              await api.post(`/events/${event.id}`, payload);
              fetchEvents();
              toast.success('Event berhasil diselesaikan!');
          } catch (error) {
              console.error('Error completing event', error);
              toast.error('Gagal menyelesaikan event');
          }
      }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="text-primary w-8 h-8" />
            Kelola Kegiatan
          </h1>
          <p className="text-gray-500 mt-1">Buat, edit, dan kelola event kampus</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Buat Event Baru
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Cari event berdasarkan judul atau lokasi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Event Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Memuat data event...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Belum ada event</h3>
          <p className="text-gray-500">Mulai dengan membuat event baru</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
              {/* Card Image */}
              <div className="h-48 bg-gray-100 relative overflow-hidden">
                <img
                  src={event.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-sm">
                  {event.price > 0 ? `Rp ${event.price.toLocaleString()}` : 'Gratis'}
                </div>
                {event.is_completed && (
                  <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Selesai
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-5">
                <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{event.time.substring(0, 5)}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>

                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEdit(event)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    <Trash className="w-4 h-4" /> Hapus
                  </button>
                </div>
                
                 {/* Completion Action */}
                 {!event.is_completed && (
                    <button 
                        onClick={() => handleCompleteEvent(event)}
                        className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                    >
                        <CheckCircle className="w-4 h-4" /> Tandai Selesai & Rilis Sertifikat
                    </button>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl relative">
              <form onSubmit={handleSubmit}>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isEditing ? 'Edit Event' : 'Buat Event Baru'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Informasi Dasar</h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Judul Event</label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Contoh: Seminar Teknologi Masa Depan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                      <textarea
                        required
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Jelaskan detail acara..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                        <input
                          type="date"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Waktu</label>
                        <input
                          type="time"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Gedung Serbaguna..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Penyelenggara</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          value={formData.organizer}
                          onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                          placeholder="BEM kampus..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Banner Image */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Banner Event</h3>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden relative">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Klik untuk upload</span> atau drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG or GIF (Max 2MB)</p>
                          </div>
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} required={!isEditing} />
                      </label>
                    </div>
                  </div>

                  {/* Certificate Link */}
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" /> Sertifikat Digital
                    </h3>
                    <p className="text-xs text-blue-600 mb-3">
                      Masukkan template gambar sertifikat (JPG/PNG). Kosongkan nama peserta, sistem akan mengisinya otomatis.
                    </p>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-blue-200 border-dashed rounded-lg cursor-pointer bg-white hover:bg-blue-50 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-6 h-6 mb-2 text-blue-400" />
                              <p className="text-xs text-blue-500">
                                {formData.certificate_template ? 'Ganti Template' : 'Upload Template (Wajib)'}
                              </p>
                          </div>
                          <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => setFormData({...formData, certificate_template: e.target.files[0]})}
                              required={!isEditing && !currentEvent?.certificate_template} 
                          />
                    </label>
                    {formData.certificate_template && (
                        <p className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> {formData.certificate_template.name}
                        </p>
                    )}
                  </div>

                  {/* Payment Info */}
                  <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Jenis & Harga
                      </h3>
                      <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isPaid: false, price: 0 })}
                          className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${!formData.isPaid ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          Gratis
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isPaid: true })}
                          className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${formData.isPaid ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          Berbayar
                        </button>
                      </div>
                    </div>

                    {formData.isPaid && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Harga Tiket (Rp)</label>
                          <input
                            type="number"
                            min="0"
                            required={formData.isPaid}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Info Pembayaran (Transfer Bank)</h4>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank</label>
                          <input
                            type="text"
                            required={formData.isPaid}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            value={formData.bank_name}
                            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                            placeholder="BCA/Mandiri..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">No. Rekening</label>
                          <input
                            type="text"
                            required={formData.isPaid}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            value={formData.account_number}
                            onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Atas Nama</label>
                          <input
                            type="text"
                            required={formData.isPaid}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            value={formData.account_holder}
                            onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>


                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all"
                  >
                    {isEditing ? 'Simpan Perubahan' : 'Buat Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
