import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Para la navegación
import AOS from "aos";
import "aos/dist/aos.css"; // Estilos de AOS

// Importa la imagen del logo desde src/assets
import logo from "../assets/logo.png";

// Importa los componentes de tu página
import Navbar from "../Layouts/Navbar";
import Hero from "../components/Hero";
import Skills from "../components/Skills";
import Service from "../components/Services";
import Projects from "../components/Projects";
import Testimonials from "../components/Testimonials";
import Hireme from "../components/Hireme";
import Contact from "../components/Contact";

const LogoAnimation = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook de React Router para redirigir

  useEffect(() => {
    AOS.init({ duration: 1500 });

    // Tiempo de animación (3 segundos)
    setTimeout(() => {
      setLoading(false); // Cambia el estado cuando la animación termina
      navigate("/home"); // Redirige a la página principal
    }, 3000); // 3 segundos de animación
  }, [navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      {loading ? (
        <div
          className="w-32 h-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${logo})` }} // Usa la imagen importada
          data-aos="fade-up"
        >
          {/* Logo */}
        </div>
      ) : (
        // Aquí mostramos el contenido principal después de la animación
        <div>
          <Navbar />
          <Hero />
          <Skills />
          <Service />
          <Projects />
          <Testimonials />
          <Hireme />
          <Contact />
          <footer className="p-3 text-center">
            <h6 className="mb-3">STEPHANIE MIRANDA</h6>
            <p> © All CopyRights Reserved 2026</p>
          </footer>
        </div>
      )}
    </div>
  );
};

export default LogoAnimation;