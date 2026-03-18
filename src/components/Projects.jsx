import { getContent } from "../Content";
import { useLanguage } from "../contexts/LanguageContext";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

import { Pagination } from "swiper";

const Projects = () => {
  const { language } = useLanguage();
  const content = getContent(language);
  const { Projects } = content;
  return (
    <section className="section-pop-artist alternate" id="projects">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 right-20 w-40 h-40 bg-accent/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-32 left-20 w-32 h-32 bg-secondary/5 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title-pop" data-aos="fade-down">
            {Projects.title}
          </h2>
          <p className="section-subtitle-pop" data-aos="fade-down" data-aos-delay="200">
            {Projects.subtitle}
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Artist Image - Left Side */}
          <div 
            className="relative"
            data-aos="fade-right"
            data-aos-delay="300"
          >
            <div className="relative">
              {/* Glowing background effect */}
              <div className="absolute -inset-8 bg-glowGradient rounded-full blur-3xl opacity-20"></div>
              
              {/* Main image container */}
              <div className="relative bg-cardGradient rounded-3xl p-6 border border-accent/20">
                <img
                  src={Projects.image}
                  alt="Stephanie Miranda Performance"
                  className="w-full h-auto object-cover rounded-2xl"
                />
                
                {/* Performance badge */}
                <div className="absolute top-4 left-4 bg-accent/90 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm font-500">
                  🎼 Live Performances
                </div>
              </div>
            </div>
          </div>

          {/* Projects Carousel - Right Side */}
          <div 
            className="relative"
            data-aos="fade-left"
            data-aos-delay="500"
          >
            <Swiper
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              spaceBetween={20}
              modules={[Pagination]}
              className="pb-16 max-w-md mx-auto"
            >
              {Projects.project_content.map((content, i) => (
                <SwiperSlide
                  key={i}
                  className="card-pop-artist overflow-hidden"
                >
                  {/* Project Image */}
                  <div className="relative mb-4 rounded-2xl overflow-hidden">
                    <img 
                      src={content.image} 
                      alt={content.title}
                      className="w-full h-48 object-cover"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    
                    {/* Project number badge */}
                    <div className="absolute top-3 right-3 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm font-600">
                      {i + 1}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-600 text-text_primary">
                      {content.title}
                    </h3>
                    
                    {/* Project tags based on type */}
                    <div className="flex flex-wrap gap-2">
                      {i === 0 && (
                        <>
                          <span className="px-2 py-1 bg-accent/10 text-accent rounded text-sm">Wedding</span>
                          <span className="px-2 py-1 bg-gold/10 text-gold rounded text-sm">Ceremony</span>
                        </>
                      )}
                      {i === 1 && (
                        <>
                          <span className="px-2 py-1 bg-secondary/10 text-secondary rounded text-sm">Corporate</span>
                          <span className="px-2 py-1 bg-tertiary/10 text-tertiary rounded text-sm">Event</span>
                        </>
                      )}
                      {i === 2 && (
                        <>
                          <span className="px-2 py-1 bg-pink/10 text-pink rounded text-sm">Cocktail</span>
                          <span className="px-2 py-1 bg-cyan/10 text-cyan rounded text-sm">Reception</span>
                        </>
                      )}
                    </div>

                    {/* Learn More Button */}
                    <div className="flex justify-between items-center pt-2">
                      <button className="text-accent hover:text-secondary transition-colors duration-300 font-500 text-sm uppercase tracking-wider">
                        View Details
                      </button>
                      
                      {/* Music note decoration */}
                      <div className="text-accent/30 text-2xl">♪</div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Projects;
