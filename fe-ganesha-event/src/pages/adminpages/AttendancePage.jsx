import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Search, Calendar, User, UserCheck, AlertCircle, X, ArrowLeft, MapPin } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../lib/axios';

export const AttendancePage = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [search, setSearch] = useState('');

  // Scan Result State
  const [scanResult, setScanResult] = useState(null); // { status: 'success'|'error'|'warning', message, user, ticket }
  const [isScanning, setIsScanning] = useState(false);
  const [recentAttendees, setRecentAttendees] = useState([]);

  // Scanner Ref
  const scannerRef = useRef(null);

  useEffect(() => {
    fetchEvents();
    return () => {
      // Cleanup scanner if component unmounts
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [search]);

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

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setScanResult(null);
    setRecentAttendees([]);
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
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
      );

      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
      } catch (error) {
        console.error("Failed to stop scanner", error);
      }
    }
    setIsScanning(false);
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    handleVerify(decodedText);
    if (scannerRef.current) {
      scannerRef.current.pause(true); // Pause scanning
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

      // Add to recent list if success or warning
      if (user) {
        setRecentAttendees(prev => [
          { ...user, time: new Date().toLocaleTimeString(), status: resultStatus },
          ...prev.slice(0, 9) // Keep last 10
        ]);
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

        {loading ? (
          <div className="text-center py-12 text-gray-500">Memuat event...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500">Tidak ada event ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
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
    <div className="space-y-6 max-w-5xl mx-auto animate-in slide-in-from-right-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scanner & Input */}
        <div className="lg:col-span-2 space-y-6">
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
                placeholder="Masukkan Kode Tiket (Contoh: TCKT-X1Y2)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
              <button type="submit" className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium">
                Verifikasi
              </button>
            </form>
          </div>
        </div>

        {/* Right: Recent Attendees & Status */}
        <div className="space-y-6">
          {/* Result Card */}
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
                      <div className="mt-2 pt-2 border-t border-black/5 flex justify-between items-center text-xs">
                        <span className="text-gray-500">Kode Tiket:</span>
                        <span className="font-mono font-medium text-gray-700">{scanResult.ticket.ticket_code}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Recent List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-gray-700">Riwayat Sesi Ini</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {recentAttendees.length === 0 ? (
                <div className="p-8 text-center">
                  <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Belum ada peserta yang check-in</p>
                </div>
              ) : (
                recentAttendees.map((attendee, idx) => (
                  <div key={idx} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm
                                          ${attendee.status === 'success' ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-yellow-400 to-yellow-600'}`}>
                        {attendee.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{attendee.name}</p>
                        <p className="text-xs text-gray-400">{attendee.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
