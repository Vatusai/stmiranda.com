/**
 * MOCK DATA - Sistema Stephanie Miranda
 * Datos de ejemplo para desarrollo y pruebas
 * Estos datos simulan la respuesta de una API real
 */

// ============================================
// CLIENTES
// ============================================
export const mockClients = [
  {
    id: 1,
    name: "María Elena García",
    email: "maria.garcia@email.com",
    phone: "+506 8888-9999",
    country: "Costa Rica",
    city: "San José",
    firstContact: "2024-01-15",
    eventType: "Boda",
    status: "active",
    notes: "Prefiere música jazz para la ceremonia. Novio es músico también.",
    eventsCount: 2,
    lastEvent: "2024-02-14",
    tags: ["VIP", "Recurrente"]
  },
  {
    id: 2,
    name: "Carlos Andrés López",
    email: "carlos.lopez@empresacr.com",
    phone: "+506 7777-8888",
    country: "Costa Rica",
    city: "Heredia",
    firstContact: "2024-02-20",
    eventType: "Corporativo",
    status: "new",
    notes: "Evento anual de la empresa. Presupuesto flexible.",
    eventsCount: 0,
    lastEvent: null,
    tags: ["Potencial alto"]
  },
  {
    id: 3,
    name: "Ana Lucía Martínez",
    email: "ana.martinez@email.com",
    phone: "+506 6666-7777",
    country: "Costa Rica",
    city: "Cartago",
    firstContact: "2024-03-01",
    eventType: "Cumpleaños",
    status: "active",
    notes: "Celebración de 50 años. Quiere sorpresa musical.",
    eventsCount: 1,
    lastEvent: "2024-03-15",
    tags: []
  },
  {
    id: 4,
    name: "Pedro Antonio Soto",
    email: "pedro.soto@email.com",
    phone: "+506 5555-6666",
    country: "Costa Rica",
    city: "Alajuela",
    firstContact: "2023-11-10",
    eventType: "Privado",
    status: "inactive",
    notes: "No respondió última cotización.",
    eventsCount: 1,
    lastEvent: "2023-12-20",
    tags: ["Seguimiento"]
  },
  {
    id: 5,
    name: "Laura Isabel Chen",
    email: "laura.chen@email.com",
    phone: "+506 4444-5555",
    country: "Costa Rica",
    city: "San José",
    firstContact: "2024-01-05",
    eventType: "Boda",
    status: "active",
    notes: "Boda destino, vienen de Estados Unidos.",
    eventsCount: 1,
    lastEvent: "2024-04-20",
    tags: ["Destino"]
  },
  {
    id: 6,
    name: "Juan Pablo Rodríguez",
    email: "juan.rodriguez@tech.com",
    phone: "+1 305-555-0123",
    country: "Estados Unidos",
    city: "Miami",
    firstContact: "2024-03-10",
    eventType: "Corporativo",
    status: "new",
    notes: "Evento tech en Costa Rica. Necesita factura internacional.",
    eventsCount: 0,
    lastEvent: null,
    tags: ["Internacional"]
  },
  {
    id: 7,
    name: "Sofia Hernández",
    email: "sofia.h@ejemplo.com",
    phone: "+506 3333-4444",
    country: "Costa Rica",
    city: "Puntarenas",
    firstContact: "2024-02-28",
    eventType: "Graduación",
    status: "active",
    notes: "Graduación universitaria. Sala de eventos confirmada.",
    eventsCount: 1,
    lastEvent: "2024-05-15",
    tags: []
  },
  {
    id: 8,
    name: "Roberto Méndez",
    email: "roberto.mendez@hotel.com",
    phone: "+506 2222-3333",
    country: "Costa Rica",
    city: "Guanacaste",
    firstContact: "2023-08-15",
    eventType: "Hotel",
    status: "active",
    notes: "Gerente de hotel. Contrata música semanal.",
    eventsCount: 12,
    lastEvent: "2024-03-20",
    tags: ["Recurrente", "Contrato anual"]
  }
];

// ============================================
// EVENTOS
// ============================================
export const mockEvents = [
  {
    id: 1,
    title: "Boda García-Soto",
    clientId: 1,
    clientName: "María Elena García",
    date: "2024-03-15",
    time: "16:00",
    duration: "5 horas",
    type: "Boda",
    location: "Hotel Real Intercontinental, San José",
    status: "confirmed",
    budget: 3500,
    description: "Ceremonia y recepción. 150 invitados.",
    services: ["Ceremonia", "Cóctel", "Recepción"],
    notes: "Check in alimentación a las 15:00. Estacionamiento confirmado.",
    googleCalendarId: null,
    createdAt: "2024-01-20",
    updatedAt: "2024-02-15"
  },
  {
    id: 2,
    title: "Evento Corporativo ACME",
    clientId: 2,
    clientName: "Carlos Andrés López",
    date: "2024-03-22",
    time: "18:00",
    duration: "4 horas",
    type: "Corporativo",
    location: "Centro de Convenciones, Heredia",
    status: "confirmed",
    budget: 2800,
    description: "Cena de gala anual. 200 ejecutivos.",
    services: ["Ambientación", "Show principal"],
    notes: "Coordinar con sonidista externo. Logo empresa en pantalla.",
    googleCalendarId: null,
    createdAt: "2024-02-25",
    updatedAt: "2024-03-01"
  },
  {
    id: 3,
    title: "Cumpleaños Familia Martínez",
    clientId: 3,
    clientName: "Ana Lucía Martínez",
    date: "2024-03-28",
    time: "19:00",
    duration: "3 horas",
    type: "Cumpleaños",
    location: "Residencia privada, Cartago",
    status: "quoted",
    budget: 1200,
    description: "Celebración sorpresa de 50 años. 40 invitados.",
    services: ["Show sorpresa", "Ambientación"],
    notes: "Confirmar entrada sin ser vista por el cumpleañero.",
    googleCalendarId: null,
    createdAt: "2024-03-05",
    updatedAt: "2024-03-10"
  },
  {
    id: 4,
    title: "Boda Chen-Vargas",
    clientId: 5,
    clientName: "Laura Isabel Chen",
    date: "2024-04-20",
    time: "15:00",
    duration: "6 horas",
    type: "Boda",
    location: "Hacienda Los Reyes, Alajuela",
    status: "confirmed",
    budget: 4500,
    description: "Boda destino. Invitados internacionales.",
    services: ["Ceremonia", "Cóctel", "Cena", "Fiesta"],
    notes: "Ceremonia bilingüe. Coordinar con wedding planner.",
    googleCalendarId: null,
    createdAt: "2024-01-10",
    updatedAt: "2024-02-20"
  },
  {
    id: 5,
    title: "Música en Vivo - Hotel",
    clientId: 8,
    clientName: "Roberto Méndez",
    date: "2024-03-27",
    time: "20:00",
    duration: "3 horas",
    type: "Hotel",
    location: "Lobby Principal, Hotel Guanacaste",
    status: "confirmed",
    budget: 500,
    description: "Música ambiental de viernes.",
    services: ["Ambientación"],
    notes: "Evento recurrente semanal.",
    googleCalendarId: null,
    createdAt: "2023-08-20",
    updatedAt: "2024-03-20"
  },
  {
    id: 6,
    title: "Reunión Corporativa Tech",
    clientId: 6,
    clientName: "Juan Pablo Rodríguez",
    date: "2024-04-05",
    time: "10:00",
    duration: "2 horas",
    type: "Corporativo",
    location: "Oficinas Tech Costa Rica, Escazú",
    status: "pending",
    budget: null,
    description: "Reunión para cotizar evento principal.",
    services: ["Cotización"],
    notes: "Primera reunión. Llevar portafolio completo.",
    googleCalendarId: null,
    createdAt: "2024-03-15",
    updatedAt: "2024-03-15"
  },
  {
    id: 7,
    title: "Graduación UCR",
    clientId: 7,
    clientName: "Sofia Hernández",
    date: "2024-05-15",
    time: "17:00",
    duration: "4 horas",
    type: "Graduación",
    location: "Salón de Eventos Universidad",
    status: "confirmed",
    budget: 1800,
    description: "Fiesta de graduación facultad de derecho.",
    services: ["Ceremonia", "Fiesta"],
    notes: "Confirmar lista de canciones con graduandos.",
    googleCalendarId: null,
    createdAt: "2024-03-01",
    updatedAt: "2024-03-10"
  },
  {
    id: 8,
    title: "Evento Privado Cancelado",
    clientId: 4,
    clientName: "Pedro Antonio Soto",
    date: "2024-02-28",
    time: "19:00",
    duration: "0 horas",
    type: "Privado",
    location: "Cancelado",
    status: "cancelled",
    budget: 0,
    description: "Evento cancelado por el cliente.",
    services: [],
    notes: "Canceló por problemas personales. Posible reagendar.",
    googleCalendarId: null,
    createdAt: "2024-01-05",
    updatedAt: "2024-02-20"
  }
];

// ============================================
// SOLICITUDES / LEADS
// ============================================
export const mockLeads = [
  {
    id: 1,
    name: "María Fernanda Vega",
    email: "mvega@email.com",
    phone: "+506 9999-0000",
    eventType: "Boda",
    eventDate: "2024-08-15",
    guests: "120",
    budget: "3000-5000",
    message: "Nos encantaría tener música en vivo para nuestra boda. ¿Tienes disponibilidad?",
    status: "new",
    source: "Website",
    createdAt: "2024-03-18",
    notes: ""
  },
  {
    id: 2,
    name: "Daniel Campos",
    email: "dcampos@company.com",
    phone: "+506 8888-1111",
    eventType: "Corporativo",
    eventDate: "2024-06-20",
    guests: "300",
    budget: "5000+",
    message: "Evento anual de la empresa. Necesitamos propuesta formal.",
    status: "contacted",
    source: "Referido",
    createdAt: "2024-03-17",
    notes: "Llamar el martes para confirmar reunión"
  },
  {
    id: 3,
    name: "Carmen Solís",
    email: "csolis@email.com",
    phone: "+506 7777-2222",
    eventType: "Cumpleaños",
    eventDate: "2024-05-10",
    guests: "50",
    budget: "1000-2000",
    message: "Cumpleaños 60 de mi madre. Queremos algo íntimo y elegante.",
    status: "quoted",
    source: "Instagram",
    createdAt: "2024-03-15",
    notes: "Cotización enviada el 16/03. Esperando respuesta."
  },
  {
    id: 4,
    name: "Javier Morales",
    email: "jmorales@email.com",
    phone: "+506 6666-3333",
    eventType: "Boda",
    eventDate: "2024-12-12",
    guests: "200",
    budget: "4000-6000",
    message: "Boda de fin de año. Nos gustaría conocer tu trabajo.",
    status: "new",
    source: "Google",
    createdAt: "2024-03-18",
    notes: ""
  }
];

// ============================================
// ESTADÍSTICAS
// ============================================
export const mockStats = {
  overview: {
    totalVisits: 1234,
    newLeads: 45,
    confirmedEvents: 12,
    pendingQuotes: 8,
    conversionRate: 26.7,
    monthlyRevenue: 12500,
    revenueGrowth: 15.2
  },
  visitsByMonth: [
    { month: "Ene", visits: 850 },
    { month: "Feb", visits: 920 },
    { month: "Mar", visits: 1234 },
    { month: "Abr", visits: 1100 },
    { month: "May", visits: 980 },
    { month: "Jun", visits: 1150 }
  ],
  eventsByType: [
    { type: "Bodas", count: 35, percentage: 35 },
    { type: "Corporativos", count: 28, percentage: 28 },
    { type: "Sociales", count: 22, percentage: 22 },
    { type: "Otros", count: 15, percentage: 15 }
  ],
  visitsByCountry: [
    { country: "Costa Rica", percentage: 65, flag: "🇨🇷" },
    { country: "Estados Unidos", percentage: 15, flag: "🇺🇸" },
    { country: "México", percentage: 8, flag: "🇲🇽" },
    { country: "Colombia", percentage: 7, flag: "🇨🇴" },
    { country: "Otros", percentage: 5, flag: "🌍" }
  ],
  revenueByMonth: [
    { month: "Ene", revenue: 8500 },
    { month: "Feb", revenue: 10200 },
    { month: "Mar", revenue: 12500 },
    { month: "Abr", revenue: 11800 },
    { month: "May", revenue: 13200 },
    { month: "Jun", revenue: 14500 }
  ],
  leadStatus: [
    { status: "Nuevo", count: 15, color: "#3B82F6" },
    { status: "Contactado", count: 12, color: "#F59E0B" },
    { status: "Cotizado", count: 10, color: "#8B5CF6" },
    { status: "Confirmado", count: 8, color: "#10B981" }
  ]
};

// ============================================
// ACTIVIDAD RECIENTE
// ============================================
export const mockRecentActivity = [
  {
    id: 1,
    type: "lead",
    action: "Nueva solicitud recibida",
    description: "María Fernanda Vega solicitó cotización para boda",
    timestamp: "2024-03-18T10:30:00",
    icon: "📧"
  },
  {
    id: 2,
    type: "event",
    action: "Evento confirmado",
    description: "Boda García-Soto - 15 de marzo confirmada",
    timestamp: "2024-03-18T09:15:00",
    icon: "✅"
  },
  {
    id: 3,
    type: "client",
    action: "Cliente actualizado",
    description: "Carlos López: reunión programada para mañana",
    timestamp: "2024-03-17T16:45:00",
    icon: "👤"
  },
  {
    id: 4,
    type: "quote",
    action: "Cotización enviada",
    description: "Cotización enviada a Carmen Solís ($1,800)",
    timestamp: "2024-03-17T14:20:00",
    icon: "📄"
  },
  {
    id: 5,
    type: "event",
    action: "Nuevo evento agendado",
    description: "Graduación UCR agendada para 15 de mayo",
    timestamp: "2024-03-17T11:00:00",
    icon: "📅"
  }
];

// ============================================
// USUARIO ADMIN
// ============================================
export const mockAdminUser = {
  id: 1,
  name: "Stephanie Miranda",
  email: "stephanie@stmiranda.com",
  avatar: null,
  role: "admin",
  preferences: {
    language: "es",
    theme: "dark",
    notifications: {
      email: true,
      whatsapp: false,
      newLeads: true,
      eventReminders: true
    }
  },
  settings: {
    googleCalendarConnected: false,
    whatsappConnected: false,
    businessName: "Stephanie Miranda Music",
    phone: "+506 7231-5028",
    defaultCurrency: "USD"
  }
};

// ============================================
// SERVICIOS / PAQUETES
// ============================================
export const mockServices = [
  {
    id: 1,
    name: "Ceremonia Nupcial",
    description: "Música para ceremonia civil o religiosa",
    price: 800,
    duration: "1 hora",
    includes: ["Ensayo previo", "Coordinación con oficiante", "Selección de repertorio"]
  },
  {
    id: 2,
    name: "Cóctel de Bienvenida",
    description: "Ambientación musical para recepción de invitados",
    price: 600,
    duration: "2 horas",
    includes: ["Equipo de sonido", "Repertorio personalizado", "Microfono para protocolo"]
  },
  {
    id: 3,
    name: "Evento Corporativo",
    description: "Música para eventos empresariales",
    price: 1500,
    duration: "4 horas",
    includes: ["Sonido profesional", "Coordinación con event planner", "Repertorio adaptado"]
  },
  {
    id: 4,
    name: "Paquete Completo Boda",
    description: "Ceremonia, cóctel y recepción",
    price: 2800,
    duration: "6 horas",
    includes: ["Todo lo incluido en servicios individuales", "Descuento especial", "Planificación completa"]
  }
];

// Helper para simular delay de API
export const simulateApiDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));
