import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft, Share2, Copy, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useEventStore } from '../../store/useEventStore';

export const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEventById, registerEvent, user, isLoading } = useEventStore();
  const [event, setEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nim: user?.nim || '',
    paymentProof: null,
  });

  useEffect(() => {
    const loadEvent = async () => {
      const data = await getEventById(id);
      setEvent(data);
      setLoadingEvent(false);
    };
    loadEvent();
  }, [id, getEventById]);

  // Update form if user data changes (e.g. after fresh login)
  useEffect(() => {
    if (user) {
        setFormData(prev => ({
            ...prev,
            name: user.name,
            email: user.email,
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

  if (loadingEvent) {
    return <div className="text-center py-12">Memuat event...</div>;
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Event tidak ditemukan</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-primary hover:underline">
          Kembali ke Home
        </button>
      </div>
    );
  }

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
      alert('Mohon lengkapi data diri anda di profil atau form ini');
    }
    
    if (event.price > 0 && !formData.paymentProof) {
        alert('Mohon upload bukti pembayaran untuk event berbayar.');
        return;
    }
    
    const success = await registerEvent(event.id, formData.paymentProof);
    if (success) {
        alert('Pendaftaran berhasil! Silakan tunggu konfirmasi admin.');
        navigate('/tickets');
    } else {
        alert('Pendaftaran gagal. Pastikan anda belum terdaftar atau coba lagi nanti.');
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{event.title}</h1>
                    <p className="text-white/90 text-lg">{event.organizer}</p>
                  </div>
                  
                  {/* Share Button & Dropdown */}
                  <div className="relative">
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
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
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
            </div>
          </div>

          <div className="p-8 flex flex-col gap-10">
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
                        disabled={isLoading}
                        className="w-full md:w-auto px-8 bg-primary hover:bg-[#5a0d1c] text-white font-bold py-3 rounded-xl transition-all transform active:scale-95 shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        {isLoading ? 'Memproses...' : 'Beli Tiket'}
                      </button>
                   </form>
                   ) : (
                     <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 text-center flex flex-col items-center gap-4">
                        <p className="text-gray-600">Anda harus login terlebih dahulu untuk mendaftar di event ini.</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full md:w-auto px-8 bg-primary hover:bg-[#5a0d1c] text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                        >
                            Masuk untuk mendaftar kegiatan
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
