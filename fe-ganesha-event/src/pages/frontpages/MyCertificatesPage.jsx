import { useEffect } from 'react';
import { Award, ExternalLink } from 'lucide-react';
import { useEventStore } from '../../store/useEventStore';
import { Link } from 'react-router-dom';

export const MyCertificatesPage = () => {
    const { tickets, fetchMyTickets, isLoading } = useEventStore();

    useEffect(() => {
        fetchMyTickets();
    }, [fetchMyTickets]);

    // Filter tickets that have an event with a certificate link AND are attended
    const myCertificates = tickets.filter(ticket => 
        ticket.event && ticket.event.certificate_link && ticket.is_attended
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Award className="text-primary" />
        Sertifikat Saya
      </h1>
      
      <p className="text-gray-600">
        Berikut adalah daftar sertifikat dari kegiatan yang telah Anda ikuti.
      </p>

      {isLoading ? (
        <div className="text-center py-12">Memuat sertifikat...</div>
      ) : myCertificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCertificates.map(({ id, event }) => (
             event && (
              <div key={id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                 <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                       <Award size={24} />
                    </div>
                 </div>
                 
                 <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                 <p className="text-sm text-gray-500 mb-6 flex-1">
                    Diselenggarakan oleh {event.organizer} pada {event.date}
                 </p>

                 <a 
                   href={event.certificate_link} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                 >
                   <ExternalLink size={16} />
                   Download Sertifikat
                 </a>
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
           <p className="text-gray-500">
             Sertifikat akan muncul jika Anda telah <b>Hadir</b> di event dan Admin telah mengunggah sertifikat.
           </p>
        </div>
      )}
    </div>
  );
};
