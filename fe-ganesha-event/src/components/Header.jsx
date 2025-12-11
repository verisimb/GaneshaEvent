import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/GaneshaEventLogo.png';

export const Header = () => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 md:h-20">
          <div className="flex items-center gap-2 md:gap-3">
            <img src={logo} alt="Ganesha Event" className="h-8 md:h-10 w-auto" />
          </div>
          <div className="flex items-center gap-2 md:gap-4">
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
          </div>
        </div>
      </div>
    </nav>
  );
};
