/**
 * Formatters
 * Utilidades para formatear datos
 */

// Formatear moneda
export const currency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Formatear fecha
export const date = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Formatear fecha corta
export const dateShort = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Obtener día
export const day = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.getDate();
};

// Obtener mes corto
export const monthShort = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date);
};

// Formatear tiempo relativo
export const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  const intervals = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600,
    minuto: 60,
    segundo: 1
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `Hace ${interval} ${unit}${interval > 1 ? (unit === 'mes' ? 'es' : 's') : ''}`;
    }
  }
  
  return 'Ahora mismo';
};

// Formatear número
export const number = (value) => {
  return new Intl.NumberFormat('es-ES').format(value);
};

// Formatear teléfono
export const phone = (value) => {
  if (!value) return '-';
  // Formato Costa Rica: +506 XXXX-XXXX
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  return value;
};

// Capitalizar primera letra
export const capitalize = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Truncar texto
export const truncate = (string, length = 50) => {
  if (!string) return '';
  if (string.length <= length) return string;
  return string.slice(0, length) + '...';
};

// Exportar todo como objeto
export const format = {
  currency,
  date,
  dateShort,
  day,
  monthShort,
  timeAgo,
  number,
  phone,
  capitalize,
  truncate
};
