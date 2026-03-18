// Hero.jsx
import { getContent } from "../Content";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations/translations";

const Hero = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const content = getContent(language);
  const { hero } = content;

  return (
    <section id="home" className="hero-pop-artist relative overflow-hidden pt-20 sm:pt-24">
      {/* Decorative musical elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="music-note-decoration absolute top-1/4 left-4 sm:left-10 text-accent">♪</div>
        <div className="music-note-decoration absolute top-1/3 right-8 sm:right-20 text-secondary">♫</div>
        <div className="music-note-decoration absolute bottom-1/4 left-1/4 text-tertiary">♩</div>
        <div className="music-note-decoration absolute bottom-1/3 right-1/3 text-pink">♬</div>
      </div>

      <div className="container mx-auto px-2 py-4 sm:px-6 sm:py-12 lg:py-20">
        <div className="min-h-[calc(100vh-5rem)] sm:min-h-[calc(100vh-6rem)] flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 sm:gap-8 lg:gap-12">

          {/* Main Content - Left Side */}
          <div className="w-full text-center lg:text-left" data-aos="fade-right" data-aos-delay="200">
            {/* Artist Name with gradient effect */}
            <div className="glow-effect glow-effect-gold glass-text mb-6 sm:mb-8 w-full">
              <div className="glow-mask"></div>
              <div className="glow-effect-content">
                <h1 className="hero-name-display mb-2 sm:mb-4">
                  {hero.title}
                </h1>
              </div>
            </div>
            
            {/* Artist tagline */}
            <div className="glow-effect glow-effect-teal glass-text mb-8 sm:mb-10 w-full">
              <div className="glow-mask"></div>
              <div className="glow-effect-content">
                <p className="hero-tagline text-white leading-relaxed">
                  {t.hero.tagline}
                </p>
              </div>
            </div>

            {/* Stats Grid - Modern Music Industry Focus */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto lg:mx-0">
              {hero.hero_content.map((content, i) => (
                <div
                  key={i}
                  data-aos="fade-up"
                  data-aos-delay={400 + (i * 200)}
                  className="stat-item-pop glass-card glow-effect glow-effect-purple"
                >
                  <div className="glow-mask"></div>
                  <div className="glow-effect-content">
                    <span className="stat-number-pop text-white text-2xl sm:text-3xl font-bold">{content.count}</span>
                    <p className="stat-label-pop text-base text-white mt-2">{content.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image - Right Side - Mobile Optimized */}
          <div className="w-full flex justify-center relative order-first lg:order-last">
            <div 
              className="relative max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl w-full"
              data-aos="fade-left"
              data-aos-delay="600"
              data-aos-duration="1000"
            >
              {/* Glowing background effect - desktop optimized */}
              <div className="absolute -inset-2 sm:-inset-4 lg:-inset-6 bg-glowGradient rounded-full blur-2xl sm:blur-3xl opacity-20 sm:opacity-30 animate-pulse"></div>
              
              {/* Better image scaling for desktop */}
              <img
                src={hero.image}
                alt="Stephanie Miranda - Professional Musician"
                className="relative w-full h-auto object-contain rounded-xl sm:rounded-2xl transform scale-105 sm:scale-110 lg:scale-115 xl:scale-120"
              />
              
              {/* Sound wave animation overlay */}
              <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 flex items-end gap-0.5 sm:gap-1 glass-text p-1 sm:p-1.5 lg:p-2 rounded-lg">
                <div className="sound-wave"></div>
                <div className="sound-wave"></div>
                <div className="sound-wave"></div>
                <div className="sound-wave"></div>
                <div className="sound-wave"></div>
              </div>

              {/* Floating badge - mobile optimized */}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 glass text-white px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded-full text-xs sm:text-sm font-medium">
                 {t.hero.professionalBadge}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-text_secondary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-text_secondary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;