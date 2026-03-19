/**
 * Fan Registration Form
 * Formulario público para que fans se registren en la comunidad
 * Separado del formulario de cotización de eventos
 */
import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Music, Heart, Mail, User, MapPin, CheckCircle } from 'lucide-react';
import { contactsApi } from '../../services/api.js';

const FanRegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    city: '',
    country: 'Costa Rica',
    wants_concert_updates: true,
    wants_private_event_info: false,
    source: 'website_fan_form'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Crear contacto como fan
      await contactsApi.create({
        ...formData,
        relationship_type: 'fan',
        notes: 'Registrado como fan desde el sitio web'
      });
      
      setIsSuccess(true);
      // Reset form después de 3 segundos
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          name: '',
          email: '',
          city: '',
          country: 'Costa Rica',
          wants_concert_updates: true,
          wants_private_event_info: false,
          source: 'website_fan_form'
        });
      }, 3000);
      
    } catch (err) {
      console.error('Error registering fan:', err);
      setError(err.message || 'Error al registrarse. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">¡Bienvenido a la comunidad! 🎵</h3>
        <p className="text-gray-300">
          Recibirás updates sobre conciertos, lanzamientos y eventos especiales.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A2E]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-violet-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Music size={24} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Únete a la Comunidad</h3>
        <p className="text-gray-400 text-sm">
          Recibe updates sobre conciertos, música y contenido exclusivo.
          <br />
          <span className="text-pink-400">Sin spam, solo música. ♪</span>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre completo *"
          icon={User}
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          placeholder="Tu nombre"
        />
        
        <Input
          label="Correo electrónico *"
          type="email"
          icon={Mail}
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          placeholder="tu@email.com"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ciudad"
            icon={MapPin}
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            placeholder="San José"
          />
          <Input
            label="País"
            value={formData.country}
            onChange={(e) => setFormData({...formData, country: e.target.value})}
            placeholder="Costa Rica"
          />
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.wants_concert_updates}
              onChange={(e) => setFormData({...formData, wants_concert_updates: e.target.checked})}
              className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              <Music size={14} className="inline mr-1 text-pink-400" />
              Quiero recibir información sobre <strong>conciertos y eventos públicos</strong>
            </span>
          </label>
          
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.wants_private_event_info}
              onChange={(e) => setFormData({...formData, wants_private_event_info: e.target.checked})}
              className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
            />
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
              <Heart size={14} className="inline mr-1 text-violet-400" />
              También me interesa información sobre <strong>eventos privados</strong> (bodas, corporativos)
            </span>
          </label>
        </div>

        <Button
          type="submit"
          variant="accent"
          fullWidth
          loading={isSubmitting}
          className="mt-4"
        >
          <Music size={18} className="mr-2" />
          Unirme a la Comunidad
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Al registrarte, aceptas recibir comunicaciones de Stephanie Miranda.
          <br />
          Puedes darte de baja en cualquier momento.
        </p>
      </form>
    </div>
  );
};

export default FanRegistrationForm;
