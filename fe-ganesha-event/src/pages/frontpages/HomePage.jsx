import React, { useEffect } from 'react';
import { Search } from 'lucide-react';
import { EventCard } from '../../components/EventCard';
import { useEventStore } from '../../store/useEventStore';

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { events, fetchEvents, isLoading } = useEventStore();

  useEffect(() => {
    fetchEvents(searchQuery);
  }, [fetchEvents, searchQuery]);

  return (
    <div className="space-y-8">
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
