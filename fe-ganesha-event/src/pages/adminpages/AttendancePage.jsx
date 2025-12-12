import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Search, Calendar, User, UserCheck, AlertCircle, X, ArrowLeft, MapPin } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import api from '../../lib/axios';
import { useAdminEvents, useAdminAttendance } from '../../hooks/useAdmin';
import { TableSkeleton } from '../../components/skeletons/TableSkeleton';
import { useQueryClient } from '@tanstack/react-query';

export const AttendancePage = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const queryClient = useQueryClient();

    // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: events, isLoading: loadingEvents } = useAdminEvents(debouncedSearch);
  // Fetch all registrations for the event
  const { data: allRegistrations, isLoading: loadingAttendees } = useAdminAttendance(selectedEvent?.id);
  
  // Filter for attendees only
  const attendees = allRegistrations ? allRegistrations.filter(t => t.is_attended) : [];

  // Scan Result State
  const [scanResult, setScanResult] = useState(null); // { status: 'success'|'error'|'warning', message, user, ticket }
  const [isScanning, setIsScanning] = useState(false);

  // Scanner Ref
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup scanner if component unmounts
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
             scannerRef.current.stop().catch(e => console.error(e));
        }
        scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setScanResult(null);
  }

  const handleBack = () => {
    if (isScanning) stopScanner();
    setSelectedEvent(null);
    setScanResult(null);
  }

  const startScanner = () => {
    setIsScanning(true);
    setScanResult(null);

    // Tiny timeout to let DOM render the id
    setTimeout(() => {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      
      // Start scanning using the rear camera (environment)
      html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        onScanSuccess, 
        onScanFailure
      )
      .catch(err => {
        console.error("Error starting scanner", err);
        setIsScanning(false);
        alert("Gagal membuka kamera. Pastikan izin kamera diberikan.");
      });

    }, 100);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
         // Pause or stop based on what's active. Stop is better for full close.
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (error) {
        console.error("Failed to stop scanner", error);
      }
    }
    setIsScanning(false);
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    // Only verify if not already processing (optional check if pause doesn't work fast enough)
    handleVerify(decodedText);
    
    // Check if scanner instance exists and has pause method
    if (scannerRef.current) {
        try {
             scannerRef.current.pause(true); 
        } catch (e) {
            console.warn("Could not pause scanner", e);
        }
    }
  };

  const onScanFailure = (error) => {
    // console.warn(`Code scan error = ${error}`);
  };

  const handleVerify = async (ticketCode) => {
    if (!selectedEvent) return;

    try {
      const response = await api.post('/tickets/verify', {
        ticket_code: ticketCode,
        event_id: selectedEvent.id
      });

      const { status, message, user, ticket } = response.data;

      let resultStatus = 'success';
      if (status === 'already_attended') resultStatus = 'warning';

      setScanResult({
        status: resultStatus,
        message: message,
        user: user,
        ticket: ticket
      });

      // Refresh attendee list if success
      if (resultStatus === 'success' || resultStatus === 'warning') {
         queryClient.invalidateQueries(['admin-attendance', selectedEvent.id]);
      }

    } catch (error) {
      console.error("Verification failed", error);
      setScanResult({
        status: 'error',
        message: error.response?.data?.message || 'Gagal memverifikasi tiket',
        user: null
      });
    } finally {
      if (scannerRef.current) {
        // Resume scanning after 2 seconds
        setTimeout(() => {
          setScanResult(null);
          scannerRef.current.resume();
        }, 3000);
      }
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode) return;
    handleVerify(manualCode);
    setManualCode('');
  };

  // View: Event Selection
  if (!selectedEvent) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="text-primary w-8 h-8" />
            Scan Absensi Event
          </h1>
          <p className="text-gray-500">Pilih event untuk memulai proses absensi</p>
        </div>

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

        {loadingEvents ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TableSkeleton rows={3} />
           </div>
        ) : events && events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">Tidak ada event ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events && events.map((event) => (
              <div
                key={event.id}
                onClick={() => handleSelectEvent(event)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                  <img
                    src={event.image_url || 'https://via.placeholder.com/400x200?text=No+Image'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.date).toLocaleDateString()} • {event.time.substring(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // View: Scanner
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in slide-in-from-right-4">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h1>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {new Date(selectedEvent.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Scanner & Input (Col Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scanner Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <QrCode className="w-4 h-4" /> Kamera Scanner
              </h3>
              {isScanning ? (
                <button onClick={stopScanner} className="text-sm text-red-600 hover:text-red-700 font-medium">Stop Kamera</button>
              ) : (
                <button onClick={startScanner} className="text-sm text-primary hover:text-primary/80 font-medium">Buka Kamera</button>
              )}
            </div>

            <div className="p-6 bg-gray-900 min-h-[300px] flex items-center justify-center relative">
              {!isScanning && (
                <div className="text-center text-gray-400">
                  <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">Kamera belum aktif</p>
                  <button onClick={startScanner} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                    Mulai Scan
                  </button>
                </div>
              )}
              <div id="reader" className={`w-full ${!isScanning ? 'hidden' : ''}`}></div>
            </div>
          </div>

          {/* Manual Input */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-700 mb-4">Input Manual</h3>
            <form onSubmit={handleManualSubmit} className="flex gap-3">
              <input
                type="text"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Kode Tiket"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
              <button type="submit" className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium">
                Cek
              </button>
            </form>
          </div>

          {/* Result Card (When scanning) */}
          {scanResult && (
            <div className={`p-6 rounded-2xl shadow-lg border-l-4 animate-in slide-in-from-top-4
                       ${scanResult.status === 'success' ? 'bg-green-50 border-green-500' :
                scanResult.status === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-red-50 border-red-500'}`}>

              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full 
                             ${scanResult.status === 'success' ? 'bg-green-100' :
                    scanResult.status === 'warning' ? 'bg-yellow-100' :
                      'bg-red-100'}`}>
                  {scanResult.status === 'success' ? <UserCheck className="w-6 h-6 text-green-600" /> :
                    scanResult.status === 'warning' ? <AlertCircle className="w-6 h-6 text-yellow-600" /> :
                      <X className="w-6 h-6 text-red-600" />}
                </div>

                <div className="flex-1">
                  <h3 className={`font-bold text-lg
                                   ${scanResult.status === 'success' ? 'text-green-800' :
                      scanResult.status === 'warning' ? 'text-yellow-800' :
                        'text-red-800'}`}>
                    {scanResult.status === 'success' ? 'Check-in Berhasil' :
                      scanResult.status === 'warning' ? 'Peringatan' : 'Gagal'}
                  </h3>
                  <p className="text-gray-700 text-sm mt-1 mb-3">{scanResult.message}</p>

                  {scanResult.user && (
                    <div className="bg-white/60 p-3 rounded-lg border border-black/5">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-500" />
                        <p className="font-semibold text-gray-900">{scanResult.user.name}</p>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">{scanResult.user.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Attendee List (Col Span 7) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Daftar Hadir</h3>
                <p className="text-sm text-gray-500">Total: {attendees.length} Peserta</p>
              </div>
              <button onClick={() => queryClient.invalidateQueries(['admin-attendance', selectedEvent.id])} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <Search className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
              {loadingAttendees ? (
                <div className="p-6">
                    <TableSkeleton rows={5} />
                </div>
              ) : attendees.length === 0 ? (
                <div className="p-12 text-center">
                  <UserCheck className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">Belum ada peserta yang check-in</p>
                  <p className="text-gray-400 text-sm mt-1">Scan QR code untuk memulai check-in</p>
                </div>
              ) : (
                <>
                {/* Desktop Table */}
                <table className="w-full text-left hidden md:table">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Peserta</th>
                      <th className="px-6 py-4">Tiket</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {attendees.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                              {item.user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{item.user.name}</p>
                              <p className="text-xs text-gray-500">{item.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">
                            {item.ticket_code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                            <UserCheck className="w-3 h-3" /> Hadir
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                  {attendees.map((item, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3 overflow-hidden">
                             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                                {item.user.name.charAt(0)}
                             </div>
                             <div className="min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{item.user.name}</p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                                   <p className="text-xs text-gray-500 truncate">{item.user.email}</p>
                                   <span className="text-[10px] font-mono bg-gray-100 px-1 rounded text-gray-400 border border-gray-200 w-fit">{item.ticket_code}</span>
                                </div>
                             </div>
                          </div>
                          <div className="shrink-0 pl-2">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 border border-green-200">
                                <UserCheck className="w-3 h-3" /> Hadir
                            </span>
                          </div>
                      </div>
                  ))}
                </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
