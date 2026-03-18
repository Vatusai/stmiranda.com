// import images
import Hero_person from "./assets/images/Hero/person.png";

import figma from "./assets/images/Skills/figma.svg";
import sketch from "./assets/images/Skills/sketch.svg";
import ps from "./assets/images/Skills/ps.svg";
import reactjs from "./assets/images/Skills/react.svg";
import nodejs from "./assets/images/Skills/node.svg";
import python from "./assets/images/Skills/python.svg";

import services_logo1 from "./assets/images/Services/logo1.svg";
import services_logo2 from "./assets/images/Services/logo2.svg";
import services_logo3 from "./assets/images/Services/logo3.svg";

import project1 from "./assets/images/Projects/img1.png";
import project2 from "./assets/images/Projects/img2.png";
import project3 from "./assets/images/Projects/img3.png";
import person_project from "./assets/images/Projects/person.png";

import avatar1 from "./assets/images/Testimonials/avatar1.png";
import avatar2 from "./assets/images/Testimonials/avatar2.png";
import avatar3 from "./assets/images/Testimonials/avatar3.png";
import avatar4 from "./assets/images/Testimonials/avatar4.png";

import Hireme_person from "./assets/images/Hireme/person.png";
import Hireme_person2 from "./assets/images/Hireme/person2.png";

// import icons from react-icons
import { GrMail } from "react-icons/gr";
import { MdArrowForward, MdCall } from "react-icons/md";
import { BsInstagram, BsYoutube, BsFacebook, BsInfoCircle } from "react-icons/bs";
import { TbSmartHome } from "react-icons/tb";
import { BiUser } from "react-icons/bi";
import { RiServiceLine, RiProjectorLine } from "react-icons/ri";
import { MdOutlinePermContactCalendar } from "react-icons/md";

// import translations
import { translations } from "./translations/translations";

export const getContent = (language = 'es') => {
  const t = translations[language];
  
  return {
  nav: [
    {
      link: "#home",
      icon: TbSmartHome,
    },
    {
      link: "#skills",
      icon: BiUser,
    },
{
      link: "#services",
      icon: RiServiceLine,
    },
    {
      link: "#projects",
      icon: RiProjectorLine,
    },
    {
      link: "#contact",
      icon: MdOutlinePermContactCalendar,
    },
  ],
  hero: {
    title: t.hero.title,
    firstName: t.hero.firstName,
    LastName: t.hero.lastName,
    btnText: t.hero.btnText,
    image: Hero_person,
    hero_content: [
      {
        count: "15+",
        text: t.hero.experience,
      },
      {
        count: "1000+",
        text: t.hero.events,
      },
    ],
  },
  skills: {
    title: t.skills.title,
    subtitle: t.skills.subtitle,
    skills_content: [
      {
        name: t.skills.items.ambiente.name,
        para: t.skills.items.ambiente.para,
        logo: figma,
      },
      {
        name: t.skills.items.gestion.name,
        para: t.skills.items.gestion.para,
        logo: nodejs,
      },
      {
        name: t.skills.items.sonido.name,
        para: t.skills.items.sonido.para,
        logo: ps,
      },
      {
        name: t.skills.items.arreglista.name,
        para: t.skills.items.arreglista.para,
        logo: reactjs,
      },
      {
        name: t.skills.items.contratos.name,
        para: t.skills.items.contratos.para,
        logo: sketch,
      },
      {
        name: t.skills.items.ceremonias.name,
        para: t.skills.items.ceremonias.para,
        logo: python,
      },
    ],
    icon: MdArrowForward,
  },
  services: {
    title: t.services.title,
    subtitle: t.services.subtitle,
    service_content: [
      {
        title: t.services.items.bodas.title,
        para: t.services.items.bodas.para,
        logo: services_logo1,
      },
      {
        title: t.services.items.coctel.title,
        para: t.services.items.coctel.para,
        logo: services_logo2,
      },
      {
        title: t.services.items.corporativos.title,
        para: t.services.items.corporativos.para,
        logo: services_logo3,
      },
    ],
  },
  Projects: {
    title: t.projects.title,
    subtitle: t.projects.subtitle,
    image: person_project,
    project_content: [
      {
        title: t.projects.items.momentos,
        image: project1,
      },
      {
        title: t.projects.items.agrupaciones,
        image: project2,
      },
      {
        title: t.projects.items.director,
        image: project3,
      },
    ],
  },
  Testimonials: {
    title: t.testimonials.title,
    subtitle: t.testimonials.subtitle,
    testimonials_content: [
      {
        review:
          "\"Mis respetos y admiración para Stephanie, sus músicos y cantantes. Un orgullo nacional. Gracias\"",
        img: avatar1,
        name: "anacemonge2211 - Instagram",
      },
      {
        review:
          "\"Excelente Stephanie!!!!!! El trabajo que realizas es increíble como te lo dije en el Jazz Café!!! Que Dios te siga bendiciendo!!\"",
        img: avatar2,
        name: "marienf - INSTAGRAM",
      },
      {
        review:
          "\"Excelentes músicos y grandes personas 🔥\"",
        img: avatar3,
        name: "jeffuriel -INSTAGRAM",
      },
      {
        review:
          "\"El talento definitivamente es más que evidente, me encanta #JuanNUE el mejor y la banda espectacular 👌\"",
        img: avatar4,
        name: "kimta_miranda - INSTAGRAM",
      },
    ],
  },
  Hireme: {
    title: t.hireme.title,
    subtitle: t.hireme.subtitle,
    image1: Hireme_person,
    image2: Hireme_person2,
    para: t.hireme.para,
    btnText: t.hireme.btnText,
  },
  Contact: {
    title: t.contact.title,
    subtitle: t.contact.subtitle,
    social_media: [
      {
        text: t.contact.social.email,
        icon: GrMail,
        link: "mailto:smirandar712@gmail.com",
      },
      {
        text: t.contact.social.phone,
        icon: MdCall,
        link: "https://wa.me/50672315028",
      },
      {
        text: t.contact.social.youtube,
        icon: BsYoutube,
        link: "https://www.youtube.com/@stephaniemirandamusic",
      },
      {
        text: t.contact.social.instagram,
        icon: BsInstagram,
        link: "https://www.instagram.com/stephaniemirandamusic/",
      },
      {
        text: t.contact.social.facebook,
        icon: BsFacebook,
        link: "https://www.instagram.com/stephaniemirandamusic/",
      },
    ],
  },
  Footer: {
    text: t.footer.text,
  },
  };
};

// For backward compatibility, export default content in Spanish
export const content = getContent('es');
