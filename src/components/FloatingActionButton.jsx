import { useState, useEffect } from "react";
import { MdCall, MdEmail } from "react-icons/md";
import { BsWhatsapp } from "react-icons/bs";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations/translations";

const FloatingActionButton = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show FAB after scrolling past hero section (500px)https://api.whatsapp.com/send/?phone=50683384214&text&type=phone_number&app_absent=0
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsExpanded(false); // Close when not visible
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
    setIsExpanded(false);
  };

  const contactActions = [
    {
      icon: MdEmail,
      label: t.floatingButton.labels.email,
      action: () => window.open("mailto:smirandar712@gmail.com", "_blank"),
      bgColor: "bg-gray hover:bg-blue-600",
      delay: "delay-75",
      labelColor: "text-blue-300", // Color personalizado para Email
      tooltipBg: "bg-blue-800",
    },
    {
      icon: BsWhatsapp,
      label: t.floatingButton.labels.whatsapp,
      action: () => window.open("https://wa.me/50672315028", "_blank"),
      bgColor: "bg-green-500 hover:bg-green-600",
      delay: "delay-100",
      labelColor: "text-green-300", // Color personalizado para WhatsApp
      tooltipBg: "bg-green-800",
    },
    {
      icon: MdCall,
      label: t.floatingButton.labels.call,
      action: () => window.open("tel:+50672315028", "_blank"),
      bgColor: "bg-gray hover:bg-blue-600",
      delay: "delay-150",
      labelColor: "text-yellow-300", // Color personalizado para Llamar
      tooltipBg: "bg-purple-800",
    },
  ];

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-3 sm:bottom-4 sm:right-4"
      style={{ maxWidth: 'calc(100vw - 12px)', boxSizing: 'border-box' }}
    >
      {/* Action buttons */}
      {isExpanded && (
        <>
          {contactActions.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  item.action();
                  setIsExpanded(false); // Close after action
                }}
                className={`
                  ${item.bgColor} ${item.delay}
                  text-white p-4 rounded-full shadow-lg 
                  transform transition-all duration-300 ease-out
                  ${isExpanded ? "scale-100 opacity-100" : "scale-0 opacity-0"}
                  hover:scale-110 hover:shadow-xl
                  group relative
                  min-h-[44px] min-w-[44px] // Touch-friendly sizing
                `}
                aria-label={item.label}
              >
                <Icon size={20} />
                {/* Tooltip - hidden on mobile for better UX */}
                <div className={`absolute right-full mr-3 top-1/2 transform -translate-y-1/2 ${item.tooltipBg} ${item.labelColor} text-sm px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium hidden sm:block`}>
                  {item.label}
                  <div className={`absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent ${item.tooltipBg === 'bg-blue-800' ? 'border-l-blue-800' : item.tooltipBg === 'bg-green-800' ? 'border-l-green-800' : 'border-l-purple-800'}`}></div>
                </div>
              </button>
            );
          })}
          
          {/* Main quote button */}
          <button
            onClick={scrollToContact}
            className="bg-dark_primary hover:bg-opacity-90 text-black px-6 py-4 rounded-full shadow-lg transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl text-sm font-semibold min-h-[44px]"
          >
            Cotización Gratis
          </button>
        </>
      )}

      {/* Main FAB button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          bg-gradient-to-r from-black to-red-600 
          text-white p-4 rounded-full shadow-2xl 
          transform transition-all duration-300 ease-out
          hover:scale-110 hover:shadow-xl
          ${isExpanded ? "rotate-45" : "rotate-0"}
          group relative
        `}
        aria-label={isExpanded ? t.floatingButton.ariaLabels.close : t.floatingButton.ariaLabels.open}
      >
        <svg
          className="w-6 h-6 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isExpanded ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          )}
        </svg>
        
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-dark_primary to-gray animate-ping opacity-20"></div>
      </button>

      {/* Mobile-specific styling */}
      <style jsx>{`
        @media (max-width: 640px) {
          .fixed.bottom-6.right-6 {
            bottom: 1rem;
            right: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingActionButton;