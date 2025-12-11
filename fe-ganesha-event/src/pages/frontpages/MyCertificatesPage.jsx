import { useEffect } from 'react';
import { Award, Download, Calendar } from 'lucide-react';
import { useEventStore } from '../../store/useEventStore';
import api from '../../lib/axios';

export const MyCertificatesPage = () => {
    const { tickets, fetchMyTickets, isLoading } = useEventStore();

    useEffect(() => {
        fetchMyTickets();
    }, [fetchMyTickets]);

    // Filter tickets that are eligible for certificates:
    // 1. Attended (is_attended = true)
    // 2. Event is completed (is_completed = true)
    // 3. Status is confirmed (just to be safe)
    const myCertificates = tickets.filter(ticket => 
        ticket.event && ticket.is_attended && ticket.event.is_completed && ticket.status === 'dikonfirmasi'
    );

    const handleDownloadCertificate = async (ticketId, eventTitle) => {
        try {
          const response = await api.get(`/tickets/${ticketId}/certificate/download`, {
            responseType: 'blob',
          });
          
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Sertifikat-${eventTitle.replace(/ /g, '-')}.jpg`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        } catch (error) {
          console.error('Download failed', error);
          let msg = 'Gagal mendownload sertifikat. Silakan coba lagi nanti.';
          
          if (error.response && error.response.data instanceof Blob) {
             try {
                const text = await error.response.data.text();
                const json = JSON.parse(text);
                if (json.message) msg = json.message;
             } catch (e) {
                // Ignore failure to parse blob
             }
          }
          alert(msg);
        }
    };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Award className="text-primary" />
        Sertifikat Saya
      </h1>
      
      <p className="text-gray-600">
        Berikut adalah daftar sertifikat dari kegiatan yang telah selesai Anda ikuti.
      </p>

      {isLoading ? (
        <div className="text-center py-12">Memuat sertifikat...</div>
      ) : myCertificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCertificates.map(({ id, event }) => (
             event && (
              <div key={id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group">
                 <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                       <Award size={24} />
                    </div>
                 </div>
                 
                 <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                 
                 <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-1">
                    <Calendar size={14} />
                    <span>{new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                 </div>

                 <button 
                   onClick={() => handleDownloadCertificate(id, event.title)}
                   className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary text-white border border-transparent rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                 >
                   <Download size={16} />
                   Download Sertifikat
                 </button>
              </div>
             )
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-gray-400" size={32} />
           </div>
           <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada sertifikat</h3>
           <p className="text-gray-500 max-w-md mx-auto">
             Sertifikat akan muncul di sini setelah Anda menyelesaikan event (Hadir) dan event telah ditandai selesai oleh panitia.
           </p>
        </div>
      )}
    </div>
  );
};
