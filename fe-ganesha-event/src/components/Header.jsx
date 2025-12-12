import { useNavigate, NavLink, Link } from 'react-router-dom';
import { useEventStore } from '../store/useEventStore';
import logo from '../assets/GaneshaEventLogo.png';
import { LogOut, LayoutDashboard, User, Ticket, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export const Header = () => {
  const { user, logout } = useEventStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
      await logout();
      toast.success('Berhasil keluar');
      navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20">
          <div className="flex items-center gap-2 md:gap-3">
            <Link to="/">
              <img src={logo} alt="Ganesha Event" className="h-8 md:h-10 w-auto" />
            </Link>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-6 mr-4">
                    <NavLink to="/tickets" className={({isActive}) => `text-sm font-medium flex items-center gap-2 ${isActive ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}>
                        <Ticket size={18} /> Tiket Saya
                    </NavLink>
                    <NavLink to="/certificates" className={({isActive}) => `text-sm font-medium flex items-center gap-2 ${isActive ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}>
                        <Award size={18} /> Sertifikat
                    </NavLink>
                </div>
                
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Keluar"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
              </>
            ) : (
              <>
                <NavLink
                to="/login"
                className="text-gray-600 hover:text-primary font-medium text-sm md:text-base px-3 py-2 md:px-4 md:py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                Masuk
                </NavLink>
                <NavLink
                to="/register"
                className="bg-primary hover:bg-[#5a0d1c] text-white text-sm md:text-base px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                Daftar
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
