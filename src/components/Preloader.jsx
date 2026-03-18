import { useEffect, useState } from 'react';
import './Preloader.css';
import Aos from 'aos';

/**
 * Text Animation Musical Preloader Component - Scrolling Text Effect
 * Features:
 * - Animated text transitions with musical themes
 * - Gradient text effects
 * - Extended loading time for better visual impact
 * - Smooth fade-out transition when loading completes
 * - AOS initialization after completion
 */
const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show skip button after 3 seconds
    const skipTimer = setTimeout(() => {
      setShowSkipButton(true);
    }, 3000);

    // Extended 6-second timer for better UX
    const textTimer = setTimeout(() => {
      setFadeOut(true);
      // Initialize AOS when preloader finishes
      setTimeout(() => {
        console.log('Initializing AOS after preloader finished...');
        Aos.init({
          duration: 1200,
          offset: 80,
          delay: 50,
          once: true,
          mirror: false,
          anchorPlacement: 'top-bottom',
        });
        Aos.refresh();
        setIsLoading(false);
      }, 600);
    }, 6000);

    // Clean text animation cycle - exactly like the reference
    const textAnimationInterval = setInterval(() => {
      if (!document.querySelector('.preloader')) return;
      
      const show = document.querySelector('span[data-show]');
      const next = show?.nextElementSibling || document.querySelector('.text-mask span:first-child');
      const up = document.querySelector('span[data-up]');

      if (up) {
        up.removeAttribute('data-up');
      }

      if (show) {
        show.removeAttribute('data-show');
        show.setAttribute('data-up', '');
      }

      if (next) {
        next.setAttribute('data-show', '');
      }
    }, 2000);

    // Cleanup
    return () => {
      clearTimeout(textTimer);
      clearTimeout(skipTimer);
      clearInterval(textAnimationInterval);
    };
  }, []);

  // Skip button handler
  const handleSkip = () => {
    setFadeOut(true);
    // Initialize AOS when skipping preloader
    setTimeout(() => {
      console.log('Initializing AOS after skip...');
      Aos.init({
        duration: 1200,
        offset: 80,
        delay: 50,
        once: true,
        mirror: false,
        anchorPlacement: 'top-bottom',
      });
      Aos.refresh();
      setIsLoading(false);
    }, 600);
  };

  // Don't render preloader if loading is complete
  if (!isLoading) {
    return null;
  }

  return (
    <div className={`preloader ${fadeOut ? 'fade-out' : ''}`}>
      {/* Text Animation Musical Preloader */}
      <div className="text-animation-container">
        <h2 className="preloader-title">
          Stephanie Miranda creates
          <div className="text-mask">
            <span data-show>magical experiences.</span>
            <span>unforgettable celebrations.</span>
            <span>memorable moments.</span>
            <span>artistic performances.</span>
          </div>
        </h2>
        
        {/* Artist signature */}
        <div className="artist-signature">
          <p>— Stephanie Miranda, Professional Musician and Producer</p>
        </div>
        
        {/* Skip button with glassmorphism */}
        {showSkipButton && (
          <button 
            className="skip-button glass" 
            onClick={handleSkip}
          >
            Skip Intro
          </button>
        )}
      </div>
    </div>
  );
};

export default Preloader;