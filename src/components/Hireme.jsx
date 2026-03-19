import { getContent } from "../Content";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations/translations";

const Hireme = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const content = getContent(language);
  const { Hireme } = content;

  return (
    <section className="section-pop-artist alternate" id="hireme">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="section-title-pop" data-aos="fade-down">
            {t.hireme.title}
          </h2>
          <p className="section-subtitle-pop" data-aos="fade-down" data-aos-delay="200">
            {t.hireme.subtitle}
          </p>
        </div>

        {/* Content */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-8 md:gap-12">
          {/* Image - Hidden on mobile, shown on md+ */}
          <img
            src={Hireme.image1}
            alt="Stephanie Miranda"
            data-aos="fade-right"
            className="hidden md:block w-full max-w-sm object-contain"
          />
          
          {/* Mobile Image */}
          <img
            src={Hireme.image2}
            alt="Stephanie Miranda"
            data-aos="fade-up"
            className="md:hidden w-full max-w-xs object-contain"
          />

          {/* Text Card */}
          <div
            data-aos="fade-left"
            className="glass-card glow-effect glow-effect-purple w-full max-w-md p-6 sm:p-8 text-center"
          >
            <div className="glow-mask"></div>
            <div className="glow-effect-content">
              <p className="leading-relaxed text-text_secondary">
                {t.hireme.para}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hireme;
