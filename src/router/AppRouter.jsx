/**
 * AppRouter
 * Configuración de rutas de la aplicación
 * Combina sitio público original + panel admin nuevo
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Language Context
import { LanguageProvider } from '../contexts/LanguageContext';

// Public Site Layout (con todos los componentes originales)
import PublicLayout from '../Layouts/PublicLayout';

// Admin Layout
import AdminLayout from '../admin/layouts/AdminLayout';

// Admin Pages
import Login from '../admin/pages/Login';
import PublicLogin from '../pages/PublicLogin';
import EventPage from '../pages/EventPage';
import Dashboard from '../admin/pages/Dashboard';
import Calendar from '../admin/pages/Calendar';
import Contacts from '../admin/pages/Contacts';
import Inquiries from '../admin/pages/Inquiries';
import EmailMarketing from '../admin/pages/EmailMarketing';
import Exports from '../admin/pages/Exports';
import Statistics from '../admin/pages/Statistics';
import Settings from '../admin/pages/Settings';

// Legacy pages (redirigen a nuevas rutas)
import Clients from '../admin/pages/Clients';

// Rutas solo para administradores
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // En desarrollo local, acceso directo sin credenciales
  if (import.meta.env.DEV) return children;

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Authenticated but not admin → back to landing
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Redirigir si ya es admin autenticado
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return null;

  // Only redirect to dashboard if actually admin
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas del sitio público - SITIO ORIGINAL COMPLETO */}
        <Route 
          path="/" 
          element={
            <LanguageProvider>
              <PublicLayout />
            </LanguageProvider>
          } 
        />
        
        {/* Public Login/Register for fans */}
        <Route path="/login" element={<PublicLogin />} />
        <Route path="/register" element={<PublicLogin mode="register" />} />

        {/* Public shareable event pages */}
        <Route path="/eventos/:slug" element={<EventPage />} />

        {/* Rutas del admin */}
        <Route 
          path="/admin/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="calendar" element={<Calendar />} />
          
          {/* NUEVAS RUTAS V2 */}
          <Route path="contacts" element={<Contacts />} />
          <Route path="inquiries" element={<Inquiries />} />
          {/* <Route path="emails" element={<EmailMarketing />} /> */}
          {/* <Route path="exports" element={<Exports />} /> */}
          
          {/* Legacy redirects */}
          <Route path="clients" element={<Navigate to="/admin/contacts" replace />} />
          
          {/* <Route path="stats" element={<Statistics />} /> */}
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Redirección 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

// Página 404
const NotFound = () => (
  <div className="min-h-screen bg-[#0F0F23] flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-violet-400 mb-4">404</h1>
      <p className="text-xl text-white mb-6">Página no encontrada</p>
      <p className="text-gray-400 mb-8">La página que buscas no existe o ha sido movida.</p>
      <a 
        href="/" 
        className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
      >
        ← Volver al inicio
      </a>
    </div>
  </div>
);

export default AppRouter;
