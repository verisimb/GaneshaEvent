import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Ganesha Event. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Universitas Pendidikan Ganesha
            </p>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-primary transition-colors text-sm">Contact Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
