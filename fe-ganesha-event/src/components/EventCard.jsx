import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EventCard = ({ event }) => {
  return (
    <Link to={`/event/${event.slug || event.id}`} className="block group h-full">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <img 
            src={event.image_url} 
            alt={event.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Overlay Gradient */}
          
          {/* Official Badge */}


          {/* Price Tag */}
          <div className="absolute bottom-4 right-4">
             <div className="bg-primary text-white font-bold text-sm px-4 py-2 rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                {event.price === 0 ? 'Gratis' : `Berbayar Rp ${event.price.toLocaleString('id-ID')}`}
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          <div className="space-y-3 mt-auto">
            <div className="flex items-start gap-3 text-gray-600 text-sm">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <Calendar size={18} />
              </div>
              <div className="mt-1">
                <span className="font-medium block">{event.date}</span>
                <span className="text-gray-500">{event.time}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-gray-600 text-sm">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <MapPin size={18} />
              </div>
              <div className="mt-1 line-clamp-2">
                {event.location}
              </div>
            </div>

            {/* Organizer */}
            <div className="flex items-center gap-3 pt-4 mt-2 border-t border-gray-100">
               <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                  {event.organizer.substring(0, 2).toUpperCase()}
               </div>
               <div>
                  <p className="text-sm font-bold text-gray-900">{event.organizer}</p>
                  <p className="text-xs text-gray-500">Penyelenggara Acara</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
