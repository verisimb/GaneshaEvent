import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useEventStore } from '../../store/useEventStore';
import { Helmet } from 'react-helmet-async';
import logo from '../../assets/GaneshaEventLogo.png';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const register = useEventStore((state) => state.register);
  const isLoading = useEventStore((state) => state.isLoading);
  const error = useEventStore((state) => state.error);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nim: '',
    phone: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      alert('Registrasi berhasil! Silakan login dengan akun baru Anda.');
      navigate('/login');
    }
  };

  return (
    <>
      <Helmet>
        <title>Daftar - Ganesha Event</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex flex-col items-center">
            <img className="h-12 w-auto mb-6" src={logo} alt="Ganesha Event" />
            <h2 className="text-3xl font-extrabold text-gray-900 text-center">
              Buat Akun Baru
            </h2>
            <p className="text-gray-500 text-center mt-2">Daftar untuk mulai mengikuti event seru</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIM (Opsional)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                value={formData.nim}
                onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP / WhatsApp</label>
              <input
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-[#5a0d1c] text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};
