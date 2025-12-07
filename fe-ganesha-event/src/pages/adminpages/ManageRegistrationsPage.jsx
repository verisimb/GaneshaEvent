import React from 'react';
import { Users } from 'lucide-react';

export const ManageRegistrationsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Users className="text-primary" />
        Kelola Pendaftar
      </h1>
      <div className="bg-white p-8 rounded-lg border border-dashed border-gray-300 text-center">
        <p className="text-gray-500">Halaman ini akan menampilkan daftar pendaftar per event untuk konfirmasi pembayaran.</p>
      </div>
    </div>
  );
};
