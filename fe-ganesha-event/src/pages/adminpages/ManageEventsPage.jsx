import React from 'react';
import { Calendar } from 'lucide-react';

export const ManageEventsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Calendar className="text-primary" />
        Kelola Kegiatan
      </h1>
      <div className="bg-white p-8 rounded-lg border border-dashed border-gray-300 text-center">
        <p className="text-gray-500">Halaman ini untuk membuat event baru dan menampilkan daftar event yang sudah dibuat (Edit, Hapus, Upload link sertifikat jika sudah ada).</p>
      </div>
    </div>
  );
};
