import React, { useEffect } from 'react';
import { Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { EventCard } from '../../components/EventCard';
import { useEventStore } from '../../store/useEventStore';

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { events, fetchEvents, isLoading, user } = useEventStore();

  useEffect(() => {
    fetchEvents(searchQuery);
  }, [fetchEvents, searchQuery]);

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Ganesha Event - Platform Event Kampus Terlengkap</title>
        <meta name="description" content="Temukan berbagai seminar, workshop, dan kegiatan mahasiswa menarik di Universitas Ganesha. Daftar mudah dan dapatkan sertifikat digital." />
        <meta property="og:title" content="Ganesha Event - Platform Event Kampus Terlengkap" />
        <meta property="og:description" content="Temukan berbagai seminar, workshop, dan kegiatan mahasiswa menarik di Universitas Ganesha." />
        <meta property="og:image" content="/og-image.jpg" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero Section for Guests */}
      {!user && (
        <div className="bg-gradient-to-r from-primary to-[#801328] rounded-3xl p-6 md:p-12 text-white relative overflow-hidden shadow-xl">
           <div className="relative z-10 max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-6 leading-tight">
                 Platform Event Kampus <br/> <span className="text-yellow-300">Terlengkap</span>
              </h1>
              <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed">
                 Temukan berbagai seminar, workshop, dan kegiatan mahasiswa menarik. Daftar mudah, dapatkan tiket instan, dan unduh sertifikat digital dalam satu aplikasi.
              </p>
              {/* Stats removed as per request */}
           </div>
           
           {/* Abstract Decoration */}
           <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-0 right-20 w-48 h-48 md:w-64 md:h-64 bg-yellow-400/20 rounded-full blur-3xl"></div>
        </div>
      )}
      {/* Header / Search Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Temukan Event Kampus</h1>
        <p className="text-gray-500 mb-6">Jelajahi berbagai kegiatan & seminar menarik di kampus.</p>
        
        <div className="relative max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all shadow-sm"
            placeholder="Cari event, seminar, atau lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
           <p className="text-center col-span-full">Memuat event...</p>
        ) : events.length > 0 ? (
          events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">Tidak ada event yang ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
};
