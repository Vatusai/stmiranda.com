import { getContent } from "../Content";
import { useLanguage } from "../contexts/LanguageContext";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper";
import { useState } from "react";

const Testimonials = () => {
  const { language } = useLanguage();
  const content = getContent(language);
  const { Testimonials } = content;
  const [activeIndex, setActiveIndex] = useState(0);
  
  return (
    <section className="section-pop-artist">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-16 w-36 h-36 bg-accent/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-16 w-28 h-28 bg-secondary/5 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-tertiary/5 rounded-full blur-xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="glass-text p-4 sm:p-6 mb-4 inline-block">
            <h2 className="section-title-pop text-white" data-aos="fade-down">
              {Testimonials.title}
            </h2>
          </div>
          <div className="glass-text p-3 sm:p-4 max-w-lg mx-auto">
            <p className="section-subtitle-pop text-white" data-aos="fade-down" data-aos-delay="200">
              {Testimonials.subtitle}
            </p>
          </div>
        </div>

        {/* Testimonials Carousel - Responsive by default */}
        <div className="max-w-4xl mx-auto">
          <Swiper
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            data-aos="fade-up"
            data-aos-delay="300"
            loop={true}
            spaceBetween={20}
            slidesPerView={1}
            centeredSlides={true}
            onSlideChange={(e) => {
              setActiveIndex(e.realIndex);
            }}
            modules={[Pagination]}
            className="pb-12 sm:pb-16"
          >
            {Testimonials.testimonials_content.map((content, i) => (
              <SwiperSlide key={i}>
                <div className="card-pop-artist glass-card mx-2 sm:mx-0">
                  {/* Quote decoration */}
                  <div className="absolute top-4 sm:top-6 left-4 sm:left-6 text-4xl sm:text-6xl text-accent/20 font-serif leading-none">
                    "
                  </div>
                  
                  <div className="pt-10 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-8 md:px-12">
                    {/* Review text */}
                    <div className="mb-6 sm:mb-8">
                      <p className="text-base sm:text-lg md:text-xl text-text_secondary leading-relaxed italic text-center">
                        {content.review}
                      </p>
                    </div>

                    {/* Client info */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                      {/* Client avatar */}
                      <div className="relative">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 sm:border-[3px] border-accent/30">
                          <img 
                            src={content.img} 
                            alt={content.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Online indicator */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-tertiary rounded-full border-2 sm:border-[3px] border-bg_light flex items-center justify-center">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                        </div>
                      </div>

                      {/* Client details */}
                      <div className="text-center sm:text-left">
                        <h4 className="text-lg sm:text-xl font-semibold text-text_primary mb-1">
                          {content.name}
                        </h4>
                        
                        {/* Star rating */}
                        <div className="flex items-center justify-center sm:justify-start gap-1 mb-2">
                          {[...Array(5)].map((_, star) => (
                            <svg 
                              key={star}
                              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold fill-current"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          ))}
                        </div>

                        {/* Client type badge */}
                        <span className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-xs sm:text-sm">
                          Follower
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom quote decoration */}
                  <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 text-4xl sm:text-6xl text-accent/20 font-serif leading-none transform rotate-180">
                    "
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
