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
// Utils
import { initGlowEffect } from "../utils/glowEffect";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations/translations";

const stats = [
  { number: '15',  suffix: '+', label: 'Años de experiencia\nen Arte Escénico' },
  { number: '1000', suffix: '+', label: 'Eventos realizados\ncon éxito' },
];

const StatsStrip = () => (
  <div className="relative py-12 sm:py-16">
    {/* Hairline rules — frame without boxing */}
    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
    <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

    <div className="container mx-auto px-6">
      <div className="flex items-center justify-center gap-12 sm:gap-20 lg:gap-28">
        {stats.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <div className="w-px h-10 bg-white/10 flex-shrink-0" />
            )}
            <div
              className="text-center"
              data-aos="fade-up"
              data-aos-delay={100 + i * 120}
            >
              {/* Number — ultra-thin for editorial luxury feel */}
              <div className="text-5xl sm:text-6xl font-thin text-white tracking-tight leading-none select-none">
                {s.number}
                <span className="text-violet-400/50">{s.suffix}</span>
              </div>
              {/* Label — tiny uppercase with generous tracking */}
              <p className="mt-3 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-gray-500 leading-relaxed whitespace-pre-line">
                {s.label}
              </p>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

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
      <StatsStrip />
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
