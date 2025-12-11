import React, { useState } from 'react';
import { useNavigate, NavLink, Outlet } from 'react-router-dom';
import { Home, Ticket, Menu, X, Award, LogOut, LogIn } from 'lucide-react';
import { clsx } from 'clsx';
import { useEventStore } from '../store/useEventStore';
import logo from '../assets/GaneshaEventLogo.png';

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout } = useEventStore();
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    setIsSidebarOpen(false);
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:transform-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
             <img src={logo} alt="Ganesha Event" className="h-10 w-auto" />
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-1">

          
          {user && (
            <>
              <NavLink
                to="/"
                end
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Home size={20} />
                Home
              </NavLink>
              <NavLink
                to="/tickets"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Ticket size={20} />
                Tiket saya
              </NavLink>
              <NavLink
                to="/certificates"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Award size={20} />
                Sertifikat saya
              </NavLink>
            </>
          )}

          <div className="pt-4 mt-4 border-t border-gray-100">
            {user ? (
              <div className="space-y-4">
                 <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-900">Halo, {user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                 </div>
                 <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                 >
                    <LogOut size={20} />
                    Keluar
                 </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <LogIn size={20} />
                Masuk / Daftar
              </NavLink>
            )}
          </div>
        </nav>


      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
             <img src={logo} alt="Ganesha Event" className="h-10 w-auto" />
          </div>
          <button onClick={toggleSidebar} className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl transform transition-all scale-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Keluar</h3>
            <p className="text-gray-500 mb-6">Apakah Anda yakin ingin keluar dari akun?</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
