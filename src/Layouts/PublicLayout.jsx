/**
 * PublicLayout
 * Layout del sitio público con todos los componentes originales
 */
import React, { useEffect } from 'react';
import Aos from "aos";
import "aos/dist/aos.css";

// Componentes originales del sitio público
import Navbar from "../Layouts/Navbar";
import Hero from "../components/Hero";
import PublicEventsSection from "../components/PublicEventsSection";
import Skills from "../components/Skills";
import Service from "../components/Services";
import Projects from "../components/Projects";
import SpotifyAlbum from "../components/SpotifyAlbum";
import Testimonials from "../components/Testimonials";
import Hireme from "../components/Hireme";
import ContactWizard from "../components/ContactWizard";
import FloatingActionButton from "../components/FloatingActionButton";
import MovingOrbs from "../components/MovingOrbs";
import Preloader from "../components/Preloader";
import AdminAccess from "../components/admin-access/AdminAccess";

// Utils
import { initGlowEffect } from "../utils/glowEffect";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations/translations";

const PublicContent = () => {
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    // Inicializar AOS
    Aos.init({
      duration: 1000,
      once: true,
      offset: 100,
    });

    // Delay glow effect
    const glowTimer = setTimeout(() => {
      initGlowEffect();
    }, 1000);

    return () => {
      clearTimeout(glowTimer);
    };
  }, []);

  return (
    <div className="bg-background min-h-screen pop-artist-theme">
      {/* Preloader */}
      <Preloader />
      
      {/* Background effects */}
      <MovingOrbs />
      
      {/* Navigation */}
      <Navbar />
      
      {/* Main sections */}
      <Hero />
      <PublicEventsSection />
      <Skills />
      <Service />
      <Projects />
      <SpotifyAlbum />
      <Testimonials />
      <Hireme />
      <ContactWizard />
      
      {/* Floating Action Button */}
      <FloatingActionButton />
      
      {/* Admin Access - Botón discreto */}
      <AdminAccess variant="floating" position="bottom-left" />
      
      {/* Footer */}
      <footer className="section-pop-artist py-8 text-center border-t border-accent/20">
        <div className="container mx-auto px-6">
          <h3 className="artist-name text-2xl mb-2">STEPHANIE MIRANDA</h3>
          <p className="text-text_muted text-sm">{t.footer.subtitle}</p>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs text-text_muted">
            <span>{t.footer.features.performances}</span>
            <span>{t.footer.features.arrangements}</span>
            <span>{t.footer.features.excellence}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Wrapper con LanguageProvider
const PublicLayout = () => {
  return (
    <PublicContent />
  );
};

export default PublicLayout;
