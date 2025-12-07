import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, X, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { QRCodeCanvas } from 'qrcode.react';
import { useEventStore } from '../../store/useEventStore';

export const MyTicketsPage = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { tickets, fetchMyTickets, isLoading } = useEventStore();

  useEffect(() => {
    fetchMyTickets();
  }, [fetchMyTickets]);

  const myTickets = tickets;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Ticket className="text-primary" />
        Tiket Saya
      </h1>

      {isLoading ? (
        <p className="text-center">Memuat tiket...</p>
      ) : myTickets.length > 0 ? (
        <div className="space-y-4">
          {myTickets.map(({ id, status, event, created_at, event_id, ticket_code }) => (
            event && (
              <div key={id} className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
                <div className="w-full sm:w-48 aspect-video sm:aspect-square rounded-lg overflow-hidden shrink-0">
                  <img src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'} alt={event.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                     <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{event.title}</h3>
                        <span className={clsx(
                          "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap",
                          status === 'menunggu_konfirmasi' ? "bg-yellow-100 text-yellow-700" : 
                          status === 'dikonfirmasi' ? "bg-green-100 text-green-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {status === 'menunggu_konfirmasi' ? 'Menunggu Konfirmasi' : 
                           status === 'dikonfirmasi' ? 'Dikonfirmasi' : 'Ditolak'}
                        </span>
                     </div>
                     <div className="text-sm text-gray-500 mb-4">
                        Dipesan pada: {new Date(created_at).toLocaleDateString()}
                     </div>
                     
                     <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                           <Calendar size={16} className="text-primary" />
                           {event.date}
                        </div>
                        <div className="flex items-center gap-2">
                           <Clock size={16} className="text-primary" />
                           {event.time} WIB
                        </div>
                        <div className="flex items-center gap-2">
                           <MapPin size={16} className="text-primary" />
                           {event.location}
                        </div>
                     </div>
                  </div>

                  <div className="mt-4 sm:mt-0 flex justify-end">
                     {status === 'dikonfirmasi' ? (
                        <button 
                          onClick={() => setSelectedTicket({ id, status, event, event_id, ticket_code })}
                          className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm text-sm"
                        >
                           Lihat Tiket
                        </button>
                     ) : null}
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-gray-400" size={32} />
           </div>
           <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada tiket</h3>
           <p className="text-gray-500 mb-6">Anda belum mendaftar ke event apapun.</p>
           <Link to="/" className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              Cari Event
           </Link>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTicket(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full flex flex-col items-center relative animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={24} />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Tiket Masuk</h3>
            <p className="text-gray-500 text-sm mb-8 text-center px-4 leading-relaxed line-clamp-2">
              {selectedTicket.event.title}
            </p>
            
            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 mb-6 shadow-sm">
              <QRCodeCanvas 
                value={selectedTicket.ticket_code || `TICKET-${selectedTicket.id}-${selectedTicket.event_id}`}
                size={220}
                level={"H"}
                className="rounded-lg"
              />
            </div>

            <div className="text-center mb-6">
              <p className="text-xs text-gray-400 font-mono mb-1">Kode Tiket</p>
              <p className="font-mono bg-gray-100 px-3 py-1 rounded text-gray-700 text-sm font-medium">
                {selectedTicket.ticket_code || `TICKET-${selectedTicket.id}-${selectedTicket.event_id}`}
              </p>
            </div>

            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Tunjukkan QR Code ini kepada petugas saat memasuki lokasi acara.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
