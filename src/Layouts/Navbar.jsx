import { useState, useEffect } from "react";
import { content } from "../Content";
import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations/translations";
import Modal from "react-modal";
import { BsWhatsapp, BsInstagram, BsYoutube } from "react-icons/bs";
import { MdEmail, MdCall } from "react-icons/md";

const contactModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "420px",
    maxHeight: "90vh",
    overflow: "auto",
    background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    borderRadius: "16px",
    padding: "1.5rem",
    color: "#FFFFFF",
  },
  overlay: {
    backgroundColor: "rgba(15, 15, 35, 0.85)",
    backdropFilter: "blur(8px)",
    zIndex: 9999,
  },
};

Modal.setAppElement("#root");

const Navbar = () => {
  const { nav } = content;
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const contactLinks = [
    {
      icon: BsWhatsapp,
      label: "WhatsApp",
      href: "https://wa.me/50672315028",
      color: "text-green-400",
      bg: "bg-green-500/10 hover:bg-green-500/20",
      border: "border-green-500/30",
    },
    {
      icon: MdEmail,
      label: "smirandar712@gmail.com",
      href: "mailto:smirandar712@gmail.com",
      color: "text-blue-400",
      bg: "bg-blue-500/10 hover:bg-blue-500/20",
      border: "border-blue-500/30",
    },
    {
      icon: MdCall,
      label: "+506 7231 5028",
      href: "tel:+50672315028",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 hover:bg-yellow-500/20",
      border: "border-yellow-500/30",
    },
    {
      icon: BsInstagram,
      label: "@stephaniemirandamusic",
      href: "https://www.instagram.com/stephaniemirandamusic/",
      color: "text-pink-400",
      bg: "bg-pink-500/10 hover:bg-pink-500/20",
      border: "border-pink-500/30",
    },
    {
      icon: BsYoutube,
      label: "YouTube",
      href: "https://www.youtube.com/@stephaniemirandamusic",
      color: "text-red-400",
      bg: "bg-red-500/10 hover:bg-red-500/20",
      border: "border-red-500/30",
    },
  ];

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      // Set sticky navbar background
      setIsScrolled(window.scrollY > 50);

      // Detect active section
      const sections = ["home", "skills", "services", "projects", "contact"];
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && scrollPosition >= section.offsetTop) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to section or handle external link
  const handleNavigation = (item) => {
    const sectionId = item.link.replace("#", "");
    if (sectionId === "contact") {
      setContactModalOpen(true);
      setIsMobileMenuOpen(false);
      return;
    }
    if (item.external && item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const offsetTop = element.offsetTop - 80;
        window.scrollTo({ top: offsetTop, behavior: "smooth" });
      }
    }
    setIsMobileMenuOpen(false);
  };

  // Smooth scroll to section (for logo button)
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId.replace("#", ""));
    if (element) {
      const offsetTop = element.offsetTop - 80; // Account for navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
    <Modal
      isOpen={contactModalOpen}
      onRequestClose={() => setContactModalOpen(false)}
      style={contactModalStyles}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">
          {language === "es" ? "Contacto" : "Contact"}
        </h3>
        <button
          onClick={() => setContactModalOpen(false)}
          className="text-text_secondary hover:text-white transition-colors duration-200 text-2xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {contactLinks.map((link, i) => {
          const Icon = link.icon;
          return (
            <a
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setContactModalOpen(false)}
              className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl border ${link.bg} ${link.border} transition-all duration-300 group`}
            >
              <Icon className={`${link.color} text-xl flex-shrink-0`} />
              <span className={`${link.color} text-sm font-medium group-hover:opacity-90`}>
                {link.label}
              </span>
            </a>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setContactModalOpen(false)}
          className="btn-pop-secondary"
        >
          {language === "es" ? "Cerrar" : "Close"}
        </button>
      </div>
    </Modal>

    <nav
      className={`fixed top-0 left-0 w-full z-50 navbar-pop-artist transition-all duration-300 ${
        isScrolled
          ? "glass shadow-2xl border-b border-accent/20"
          : "glass-text"
      }`}
      style={{ maxWidth: '100vw', boxSizing: 'border-box' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Brand */}
          <div className="flex-shrink-0">
            <button
              onClick={() => scrollToSection("#home")}
              className={`text-2xl font-Display font-700 transition-all duration-300 transform artist-name ${
                isScrolled ? "text-text_primary" : "text-text_primary"
              } hover:scale-105 hover:text-accent hover:drop-shadow-lg`}
            >
              Stephanie Miranda
            </button>
          </div>

          {/* Language Toggle Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center px-3 py-2 rounded-full text-sm font-500 transition-all duration-300 transform hover:scale-105 glass-text hover:bg-accent/10 hover:shadow-lg hover:shadow-accent/10 text-text_secondary hover:text-accent border border-accent/20 hover:border-accent/40"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <span className="text-base mr-2">{language === 'es' ? '🇪🇸' : '🇺🇸'}</span>
              <span className="uppercase font-600">{language === 'es' ? 'ES' : 'EN'}</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {nav.map((item, index) => {
                const sectionId = item.external ? item.link : item.link.replace("#", "");
                const isActive = !item.external && activeSection === sectionId;
                const Icon = item.icon;

                return (
                  <button
                    key={index}
                    onClick={() => handleNavigation(item)}
                    className={`nav-item-pop group flex items-center px-4 py-2 rounded-full text-sm font-500 transition-all duration-300 transform ${
                      isActive
                        ? "glass bg-accent text-white shadow-lg shadow-accent/20 scale-105"
                        : "text-text_secondary hover:text-text_primary glass-text hover:scale-105 hover:bg-accent/10 hover:shadow-lg hover:shadow-accent/10"
                    } ${item.external ? "hover:bg-accent/15" : ""}`}
                  >
                    <Icon
                      className={`mr-2 transition-all duration-300 ${
                        isActive ? "scale-110 text-white" : "group-hover:scale-110 group-hover:text-accent"
                      }`}
                      size={18}
                    />
                    <span className="capitalize transition-all duration-300 group-hover:text-accent">
                      {sectionId === "home"
                        ? t.nav.home
                        : sectionId === "skills"
                        ? t.nav.skills
                        : sectionId === "bio"
                        ? t.nav.bio
                        : sectionId === "services"
                        ? t.nav.services
                        : sectionId === "projects"
                        ? t.nav.projects
                        : t.nav.contact}
                    </span>
                    {item.external && (
                      <svg
                        className="ml-1 w-3 h-3 opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                          clipRule="evenodd"
                        />
                        <path
                          fillRule="evenodd"
                          d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Language Toggle and Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center px-2 py-1 rounded-full text-xs font-500 transition-all duration-300 transform hover:scale-105 glass-text hover:bg-accent/10 text-text_secondary hover:text-accent border border-accent/20"
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <span className="text-sm mr-1">{language === 'es' ? '🇪🇸' : '🇺🇸'}</span>
              <span className="uppercase font-600 text-xs">{language === 'es' ? 'ES' : 'EN'}</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`inline-flex items-center justify-center p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                isScrolled
                  ? "text-text_primary hover:bg-accent/10 border border-accent/20 hover:border-accent/40 hover:text-accent hover:shadow-lg hover:shadow-accent/10"
                  : "text-text_primary hover:bg-accent/10 border border-accent/20 hover:border-accent/40 hover:text-accent hover:shadow-lg hover:shadow-accent/10"
              }`}
              aria-label="Main menu"
            >
              <svg
                className={`h-6 w-6 transition-transform duration-300 ${
                  isMobileMenuOpen ? "rotate-90" : ""
                }`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-4 pt-4 pb-6 space-y-2 sm:px-6 glass shadow-2xl border-t border-accent/20">
          {nav.map((item, index) => {
            const sectionId = item.external ? item.link : item.link.replace("#", "");
            const isActive = !item.external && activeSection === sectionId;
            const Icon = item.icon;

            return (
              <button
                key={index}
                onClick={() => handleNavigation(item)}
                className={`group w-full flex items-center px-4 py-3 rounded-2xl text-base font-500 transition-all duration-300 ${
                  isActive
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "text-text_secondary hover:bg-accent/10 hover:text-text_primary"
                }`}
              >
                <Icon
                  className={`mr-4 transition-transform duration-300 ${
                    isActive ? "scale-110" : "group-hover:scale-105"
                  }`}
                  size={20}
                />
                <span className="capitalize flex-1 text-left">
                  {sectionId === "home"
                    ? t.nav.home
                    : sectionId === "skills"
                    ? t.nav.skills
                    : sectionId === "bio"
                    ? t.nav.bio
                    : sectionId === "services"
                    ? t.nav.services
                    : sectionId === "projects"
                    ? t.nav.projects
                    : t.nav.contact}
                </span>
                {item.external && (
                  <svg
                    className="w-4 h-4 opacity-60"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
