import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { Toaster } from 'react-hot-toast';

// Lazy Load Pages
const HomePage = lazy(() => import('./pages/frontpages/HomePage').then(module => ({ default: module.HomePage })));
const EventDetailPage = lazy(() => import('./pages/frontpages/EventDetailPage').then(module => ({ default: module.EventDetailPage })));
const MyTicketsPage = lazy(() => import('./pages/frontpages/MyTicketsPage').then(module => ({ default: module.MyTicketsPage })));
const LoginPage = lazy(() => import('./pages/frontpages/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/frontpages/RegisterPage').then(module => ({ default: module.RegisterPage })));
const MyCertificatesPage = lazy(() => import('./pages/frontpages/MyCertificatesPage').then(module => ({ default: module.MyCertificatesPage })));

const ManageEventsPage = lazy(() => import('./pages/adminpages/ManageEventsPage').then(module => ({ default: module.ManageEventsPage })));
const ManageRegistrationsPage = lazy(() => import('./pages/adminpages/ManageRegistrationsPage').then(module => ({ default: module.ManageRegistrationsPage })));
const AttendancePage = lazy(() => import('./pages/adminpages/AttendancePage').then(module => ({ default: module.AttendancePage })));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'text-sm font-medium',
          style: {
            padding: '16px',
            color: '#333',
            fontFamily: 'Inter, sans-serif',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            style: {
              borderLeft: '4px solid #10B981',
            },
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            style: {
              borderLeft: '4px solid #EF4444',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="tickets" element={<MyTicketsPage />} />
            <Route path="certificates" element={<MyCertificatesPage />} />
            <Route path="event/:slug" element={<EventDetailPage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="events" replace />} />
            <Route path="events" element={<ManageEventsPage />} />
            <Route path="registrations" element={<ManageRegistrationsPage />} />
            <Route path="attendance" element={<AttendancePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
