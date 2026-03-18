import { getContent } from "../Content";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations/translations";

const Services = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const content = getContent(language);
  const { services } = content;
  
  return (
    <section id="services" className="section-pop-artist alternate">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/5 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-tertiary/5 rounded-full blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="glow-effect glow-effect-orange glass-text p-4 sm:p-6 mb-4 inline-block w-full sm:w-auto">
            <div className="glow-mask"></div>
            <div className="glow-effect-content">
              <h2 className="section-title-pop text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl" data-aos="fade-down">
                {services.title}
              </h2>
            </div>
          </div>
          {/* Removed the 'Lo que ofrecemos' subtitle container */}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {services.service_content.map((content, i) => (
            <div
              key={i}
              data-aos="fade-up"
              data-aos-delay={200 + (i * 150)}
              className="service-card-pop glass-card glow-effect glow-effect-purple group"
            >
              <div className="glow-mask"></div>
              <div className="glow-effect-content p-5 sm:p-6">
                {/* Service Icon */}
                <div className="service-icon-pop mb-4 sm:mb-6">
                  <img 
                    src={content.logo} 
                    alt={content.title}
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain brightness-0 invert opacity-90" 
                  />
                </div>

                {/* Service Title */}
                <h3 className="text-xl sm:text-2xl font-600 text-text_primary mb-3 sm:mb-4 group-hover:text-secondary transition-colors duration-300">
                  {content.title}
                </h3>

                {/* Service Description */}
                <p className="text-text_secondary leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base">
                  {content.para}
                </p>

                {/* Premium Features Badge */}
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                {i === 0 && (
                  <>
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs sm:text-sm font-500">{t.services.badges.professionalSetup}</span>
                    <span className="px-3 py-1 bg-gold/10 text-gold rounded-full text-xs sm:text-sm font-500">{t.services.badges.premiumExperience}</span>
                  </>
                )}
                {i === 1 && (
                  <>
                    <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs sm:text-sm font-500">{t.services.badges.customArrangements}</span>
                    <span className="px-3 py-1 bg-tertiary/10 text-tertiary rounded-full text-xs sm:text-sm font-500">{t.services.badges.livePerformance}</span>
                  </>
                )}
                {i === 2 && (
                  <>
                    <span className="px-3 py-1 bg-pink/10 text-pink rounded-full text-xs sm:text-sm font-500">{t.services.badges.elegantAtmosphere}</span>
                    <span className="px-3 py-1 bg-cyan/10 text-cyan rounded-full text-xs sm:text-sm font-500">{t.services.badges.backgroundMusic}</span>
                  </>
                )}
                </div>

                {/* Learn More Link */}
                <div className="flex items-center justify-between">
                  <a 
                    href="#contact"
                    className="inline-flex items-center text-accent hover:text-secondary transition-colors duration-300 font-500 text-sm sm:text-base"
                  >
                    {t.services.learnMore}
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>

                  {/* Service Quality Indicator */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, star) => (
                      <svg 
                        key={star}
                        className="w-4 h-4 text-gold fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Services;