import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/frontpages/HomePage';
import { EventDetailPage } from './pages/frontpages/EventDetailPage';
import { MyTicketsPage } from './pages/frontpages/MyTicketsPage';
import { LoginPage } from './pages/frontpages/LoginPage';
import { RegisterPage } from './pages/frontpages/RegisterPage';
import { MyCertificatesPage } from './pages/frontpages/MyCertificatesPage';

import { AdminLayout } from './layouts/AdminLayout';
import { ManageEventsPage } from './pages/adminpages/ManageEventsPage';
import { ManageRegistrationsPage } from './pages/adminpages/ManageRegistrationsPage';
import { AttendancePage } from './pages/adminpages/AttendancePage';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="tickets" element={<MyTicketsPage />} />
        <Route path="certificates" element={<MyCertificatesPage />} />
        <Route path="event/:id" element={<EventDetailPage />} />
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
  );
};

export default App;
