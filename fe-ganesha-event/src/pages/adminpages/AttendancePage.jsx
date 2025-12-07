import React from 'react';
import { QrCode } from 'lucide-react';

export const AttendancePage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <QrCode className="text-primary" />
        Absensi
      </h1>
      <div className="bg-white p-8 rounded-lg border border-dashed border-gray-300 text-center">
        <p className="text-gray-500">Halaman ini akan digunakan untuk Scan QR Code peserta saat acara berlangsung dan untuk melihat daftar peserta yang hadir.</p>
      </div>
    </div>
  );
};
