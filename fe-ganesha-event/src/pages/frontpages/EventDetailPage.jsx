import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft, Share2, Copy, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useEventStore } from '../../store/useEventStore';
import { useEvent } from '../../hooks/useEvents';
import { EventDetailSkeleton } from '../../components/skeletons/EventDetailSkeleton';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

export const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { registerEvent, user, isLoading: isRegistering } = useEventStore();
  const { data: event, isLoading: loadingEvent, isError } = useEvent(id);
  
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    nim: '',
    paymentProof: null,
  });

  // Update form if user data changes (e.g. after fresh login)
  useEffect(() => {
    if (user) {
        setFormData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            nim: user.nim || ''
        }));
    }
  }, [user]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `Cek event keren ini: ${event.title} di Ganesha Event! \nLink: ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // 1. Loading State
  if (loadingEvent) {
    return <EventDetailSkeleton />;
  }

  // 2. Error State
  if (isError || !event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Event tidak ditemukan</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-primary hover:underline">
          Kembali ke Home
        </button>
      </div>
    );
  }

  // 3. Completed Event State
  // Hide completed events from detail view
  if (event.is_completed) {
      return (
        <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Event tidak ditemukan</h2>
            <button onClick={() => navigate('/')} className="mt-4 text-primary hover:underline">
            Kembali ke Home
            </button>
        </div>
      );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.nim || !formData.phone) {
      toast.error('Mohon lengkapi data diri anda di profil atau form ini');
    }
    
    if (event.price > 0 && !formData.paymentProof) {
        toast.error('Mohon upload bukti pembayaran untuk event berbayar.');
        return;
    }
    
    const success = await registerEvent(event.id, formData.paymentProof);
    if (success) {
        await Swal.fire({
          title: 'Pendaftaran Berhasil!',
          text: 'Silakan tunggu konfirmasi admin.',
          icon: 'success',
          confirmButtonText: 'Lihat Tiket',
          confirmButtonColor: '#6C1022',
          customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'font-bold px-6 py-2 rounded-xl'
          }
        });
        navigate('/tickets');
    } else {
        toast.error('Pendaftaran gagal. Pastikan anda belum terdaftar atau coba lagi nanti.');
    }
  };

  return (
    <>
      <Helmet>
        <title>{event.title} - Ganesha Event</title>
        <meta name="description" content={event.description} />
        {/* Open Graph / Social Media Tags */}
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description?.substring(0, 150)} />
        <meta property="og:image" content={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
        
        {/* JSON-LD Structured Data for Google Rich Snippets */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": event.title,
            "description": event.description,
            "image": event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
            "startDate": event.date, // Note: Should ideally be ISO format (YYYY-MM-DDTHH:mm:ss) but using date string for now
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "location": {
              "@type": "Place",
              "name": event.location,
              "address": {
                "@type": "PostalAddress",
                "streetAddress": event.location,
                "addressLocality": "Singaraja",
                "addressRegion": "Bali",
                "addressCountry": "ID"
              }
            },
            "organizer": {
              "@type": "Organization",
              "name": event.organizer
            },
            "offers": {
              "@type": "Offer",
              "price": event.price,
              "priceCurrency": "IDR",
              "availability": "https://schema.org/InStock"
            }
          })}
        </script>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Kembali
        </button>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="relative h-64 md:h-96">
            <img src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'} alt={event.title} className="w-full h-full object-cover" />
          </div>

          <div className="p-4 md:p-8 flex flex-col gap-8 md:gap-10">
             
             {/* Header Section: Title, Organizer, Share */}
             <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-100 pb-6">
                <div className="space-y-2">
                   <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{event.title}</h1>
                   <p className="text-gray-600 text-lg flex items-center gap-2">
                      Diselenggarakan oleh <span className="font-bold text-primary">{event.organizer}</span>
                   </p>
                </div>

                {/* Share Button & Dropdown */}
                <div className="relative shrink-0 mt-2 md:mt-0">
                    <button 
                      onClick={() => {
                          if (navigator.share) {
                              navigator.share({
                                  title: event.title,
                                  text: `Cek event keren ini: ${event.title} di Ganesha Event!`,
                                  url: window.location.href,
                              }).catch(console.error);
                          } else {
                              setShowShareMenu(!showShareMenu);
                          }
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-gray-200"
                    >
                       <Share2 size={16} />
                       Bagikan
                    </button>

                    {/* Desktop Fallback Dropdown */}
                    {showShareMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                          <button 
                              onClick={() => {
                                  handleWhatsAppShare();
                                  setShowShareMenu(false);
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                              <Share2 size={16} className="text-green-500" />
                              WhatsApp
                          </button>
                          <div className="border-b border-gray-100"></div>
                          <button 
                              onClick={() => {
                                  handleCopyLink();
                                  setShowShareMenu(false);
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                              {copied ? <Check size={16} className="text-primary" /> : <Copy size={16} className="text-gray-400" />}
                              {copied ? 'Tersalin' : 'Salin Link'}
                          </button>
                      </div>
                    )}
                </div>
             </div>
             <div className="space-y-6">
                <section>
                   <h2 className="text-xl font-bold text-gray-900 mb-4">Tentang Event</h2>
                   <p className="text-gray-600 leading-relaxed text-justify">
                      {event.description}
                   </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                      <Calendar className="text-blue-600 shrink-0" />
                      <div>
                         <p className="font-bold text-gray-900">Tanggal & Waktu</p>
                         <p className="text-gray-600 mt-1">{event.date}</p>
                         <p className="text-gray-500">{event.time} WIB</p>
                      </div>
                   </div>
                   <div className="bg-red-50 p-4 rounded-xl flex items-start gap-3">
                      <MapPin className="text-primary shrink-0" />
                      <div>
                         <p className="font-bold text-gray-900">Lokasi</p>
                         <p className="text-gray-600 mt-1">{event.location}</p>
                      </div>
                   </div>
                </div>
             </div>

             <div className="w-full">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg">
                   <h3 className="text-lg font-bold text-gray-900 mb-4">Daftar Sekarang</h3>
                   <div className="mb-6 flex items-center gap-4">
                      <span className="text-gray-500 text-sm">Harga Tiket:</span>
                      <p className="text-3xl font-bold text-primary">
                        {event.price === 0 ? 'Gratis' : `Rp ${event.price.toLocaleString('id-ID')}`}
                      </p>
                   </div>
                   
                   {user ? (
                   <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-gray-50"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                        <input 
                          type="text" 
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                          value={formData.nim}
                          onChange={e => setFormData({...formData, nim: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                          type="email" 
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-gray-50"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP / WhatsApp</label>
                        <input 
                          type="tel" 
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          placeholder="08xxxxxxxxxx"
                        />
                      </div>

                      {event.price > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                          <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2">Pembayaran</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                              <p>Silakan transfer pembayaran sebesar <span className="font-bold text-primary">Rp {event.price.toLocaleString('id-ID')}</span> ke:</p>
                              <div className="bg-white p-3 rounded border border-gray-100 mt-2">
                                <p className="font-bold text-gray-800">{event.bank_name || 'Bank BNI'}</p>
                                <p className="text-lg font-mono text-gray-900 tracking-wider">{event.account_number || '1234567890'}</p>
                                <p className="text-gray-600">a.n. {event.account_holder || `Panitia ${event.organizer}`}</p>
                              </div>
                          </div>
                          
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Bukti Pembayaran</label>
                              <input 
                                  type="file" 
                                  accept="image/*"
                                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                  onChange={(e) => setFormData({...formData, paymentProof: e.target.files[0]})}
                              />
                              <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG, PDF. Maks 2MB.</p>
                          </div>
                        </div>
                      )}
                      
                      <button 
                        type="submit"
                        disabled={isRegistering}
                        className="w-full md:w-auto px-8 bg-primary hover:bg-[#5a0d1c] text-white font-bold py-3 rounded-xl transition-all transform active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        {isRegistering ? 'Memproses...' : 'Beli Tiket'}
                      </button>
                   </form>
                   ) : (
                     <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center flex flex-col items-center gap-3">
                        <p className="text-gray-600">Anda harus login terlebih dahulu untuk mendaftar di event ini.</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-6 bg-primary hover:bg-[#5a0d1c] text-white font-bold py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg"
                        >
                            Masuk untuk Mendaftar
                        </button>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </>
  );
};
