/**
 * App Component
 * Punto de entrada principal de la aplicación
 * Combina sitio público + panel administrativo
 */
import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './router/AppRouter';
import './styles/admin-theme.css';

const App = () => {
  // Inicializar auth al cargar
  useEffect(() => {
    // Verificar sesión guardada
    const checkStoredAuth = () => {
      const stored = localStorage.getItem('stmiranda_auth');
      if (stored) {
        try {
          JSON.parse(stored);
        } catch {
          localStorage.removeItem('stmiranda_auth');
        }
      }
    };
    checkStoredAuth();
  }, []);

  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
