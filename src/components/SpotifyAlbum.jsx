import React from 'react';

const SpotifyAlbum = () => {
  return (
    <section className="section-pop-artist relative" id="spotify">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/5 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-tertiary/5 rounded-full blur-xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="glow-effect glow-effect-green glass-text p-4 sm:p-6 mb-4 inline-block w-full sm:w-auto">
            <div className="glow-mask"></div>
            <div className="glow-effect-content">
              <h2 className="section-title-pop text-white text-xl sm:text-2xl md:text-3xl" data-aos="fade-down">
                Listen to My Music
              </h2>
            </div>
          </div>
          <div className="glow-effect glow-effect-teal glass-text p-3 sm:p-4 inline-block w-full sm:w-auto">
            <div className="glow-mask"></div>
            <div className="glow-effect-content">
              <p className="text-white text-sm sm:text-base" data-aos="fade-up" data-aos-delay="200">
                Experience the musical journey through my latest album
              </p>
            </div>
          </div>
        </div>

        {/* Spotify Album Embed */}
        <div className="max-w-4xl mx-auto" data-aos="fade-up" data-aos-delay="400">
          <div className="glass-card glow-effect glow-effect-purple p-4 sm:p-6 lg:p-8">
            <div className="glow-mask"></div>
            <div className="glow-effect-content">
              {/* Musical notes decoration */}
              <div className="absolute top-4 left-4 text-accent opacity-20">♫</div>
              <div className="absolute top-4 right-4 text-secondary opacity-20">♪</div>
              <div className="absolute bottom-4 left-4 text-tertiary opacity-20">♩</div>
              <div className="absolute bottom-4 right-4 text-pink opacity-20">♬</div>
              
              <div className="relative z-10">
                {/* Album info */}
                <div className="text-center mb-6">
                  <h3 className="text-white text-xl sm:text-2xl font-semibold mb-2">
                    Featured Album
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base">
                    Professional musical performances and compositions
                  </p>
                </div>

                {/* Spotify Embed */}
                <div className="spotify-embed-container relative rounded-xl overflow-hidden">
                  <iframe
                    src="https://open.spotify.com/embed/artist/4c952oiCTaIBNwAbM5T300?utm_source=generator&theme=0"
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowfullscreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title="Spotify Artist Player"
                    className="rounded-xl"
                  ></iframe>
                  
                  {/* Overlay for better integration */}
                  <div className="absolute inset-0 pointer-events-none rounded-xl ring-1 ring-white/10"></div>
                </div>

                {/* Call to action */}
                <div className="text-center mt-6">
                  <a 
                    href="https://open.spotify.com/intl-es/artist/4c952oiCTaIBNwAbM5T300"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 btn-pop-primary glass hover:scale-105 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    Listen on Spotify
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpotifyAlbum;