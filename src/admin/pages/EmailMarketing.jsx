/**
 * Email Marketing Page
 * Gestión de newsletters y automatizaciones de email
 */
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { 
  Mail, 
  Send, 
  Users, 
  Heart, 
  Loader2,
  CheckCircle,
  AlertCircle,
  History,
  Settings
} from 'lucide-react';
import { contactsApi } from '../../services/api';
import Badge from '../../components/ui/Badge';

const EmailMarketing = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  
  const [newsletter, setNewsletter] = useState({
    subject: '',
    content: '',
    contentText: '',
    ctaText: '',
    ctaUrl: ''
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const data = await contactsApi.getAll({ wants_concert_updates: 'true' });
      setContacts(data.contacts);
    } catch (err) {
      console.error('Error loading contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!newsletter.subject || !newsletter.content) {
      alert('Por favor completa el asunto y contenido');
      return;
    }
    
    if (!confirm(`¿Enviar newsletter a ${contacts.length} fans?`)) return;
    
    setIsSending(true);
    try {
      // Simulación - en producción llamaría a la API real
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSendResult({
        success: true,
        sent: contacts.length,
        failed: 0
      });
      
      setShowModal(false);
      setNewsletter({ subject: '', content: '', contentText: '', ctaText: '', ctaUrl: '' });
    } catch (err) {
      setSendResult({ success: false, error: err.message });
    } finally {
      setIsSending(false);
    }
  };

  const fanCount = contacts.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Marketing</h1>
          <p className="text-gray-400 mt-1">Newsletters y comunicaciones a la comunidad</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card padding="sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-500/10 rounded-xl">
              <Heart size={24} className="text-pink-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{fanCount}</p>
              <p className="text-sm text-gray-400">Fans suscritos</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-500/10 rounded-xl">
              <Mail size={24} className="text-violet-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">—</p>
              <p className="text-sm text-gray-400">Emails enviados</p>
            </div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <CheckCircle size={24} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">—</p>
              <p className="text-sm text-gray-400">Tasa de apertura</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Newsletter to Fans */}
        <Card className="cursor-pointer hover:border-pink-500/30 transition-colors" onClick={() => setShowModal(true)}>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-pink-500/10 rounded-xl">
                <Heart size={32} className="text-pink-400" />
              </div>
              <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm">
                {fanCount} suscriptores
              </span>
            </div>
            <h3 className="text-xl font-semibold text-white mt-4">Newsletter a Fans</h3>
            <p className="text-gray-400 mt-2">
              Envía updates sobre conciertos, lanzamientos y contenido exclusivo a los fans que se suscribieron.
            </p>
            <Button variant="primary" className="mt-4" leftIcon={<Send size={16} />}>
              Crear Newsletter
            </Button>
          </div>
        </Card>

        {/* Follow-ups */}
        <Card className="cursor-pointer hover:border-violet-500/30 transition-colors" 
          onClick={() => window.location.href = '/admin/inquiries'}>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-violet-500/10 rounded-xl">
                <Mail size={32} className="text-violet-400" />
              </div>
              <span className="px-3 py-1 bg-violet-500/20 text-violet-400 rounded-full text-sm">
                Automático
              </span>
            </div>
            <h3 className="text-xl font-semibold text-white mt-4">Follow-ups de Cotizaciones</h3>
            <p className="text-gray-400 mt-2">
              Envía seguimientos personalizados a leads en el pipeline comercial.
            </p>
            <Button variant="secondary" className="mt-4">
              Ver Pipeline
            </Button>
          </div>
        </Card>
      </div>

      {/* Templates Info */}
      <Card>
        <Card.Header>
          <Card.Title>Templates Disponibles</Card.Title>
        </Card.Header>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Heart size={20} className="text-pink-400" />
              <div>
                <p className="font-medium text-white">Newsletter de Fans</p>
                <p className="text-sm text-gray-400">Updates de conciertos y música</p>
              </div>
            </div>
            <Badge variant="success">Activo</Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-violet-400" />
              <div>
                <p className="font-medium text-white">Follow-up de Cotización</p>
                <p className="text-sm text-gray-400">Seguimiento de eventos privados</p>
              </div>
            </div>
            <Badge variant="primary">Activo</Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-400" />
              <div>
                <p className="font-medium text-white">Confirmación de Evento</p>
                <p className="text-sm text-gray-400">Cuando se confirma una cotización</p>
              </div>
            </div>
            <Badge variant="success">Activo</Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-amber-400" />
              <div>
                <p className="font-medium text-white">Recordatorio de Evento</p>
                <p className="text-sm text-gray-400">24 horas antes del evento</p>
              </div>
            </div>
            <Badge variant="warning">Automático</Badge>
          </div>
        </div>
      </Card>

      {/* Newsletter Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => !isSending && setShowModal(false)}
        title="Crear Newsletter"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)} disabled={isSending}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              leftIcon={isSending ? <Loader2 className="animate-spin" /> : <Send />}
              onClick={handleSendNewsletter}
              loading={isSending}
            >
              {isSending ? 'Enviando...' : `Enviar a ${fanCount} fans`}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-pink-500/10 rounded-xl">
            <p className="text-sm text-pink-400">
              <Heart size={16} className="inline mr-2" />
              Este newsletter se enviará a <strong>{fanCount} fans</strong> que están suscritos a updates de conciertos.
            </p>
          </div>
          
          <Input
            label="Asunto *"
            value={newsletter.subject}
            onChange={(e) => setNewsletter({...newsletter, subject: e.target.value})}
            placeholder="🎵 Nuevo concierto anunciado"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contenido HTML *</label>
            <textarea
              rows={8}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm"
              value={newsletter.content}
              onChange={(e) => setNewsletter({...newsletter, content: e.target.value})}
              placeholder="<h2>¡Hola!</h2><p>Tenemos noticias emocionantes...</p>"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Versión Texto (para clientes que no soportan HTML)</label>
            <textarea
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
              value={newsletter.contentText}
              onChange={(e) => setNewsletter({...newsletter, contentText: e.target.value})}
              placeholder="Versión en texto plano..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Texto del Botón CTA"
              value={newsletter.ctaText}
              onChange={(e) => setNewsletter({...newsletter, ctaText: e.target.value})}
              placeholder="Ver más detalles"
            />
            <Input
              label="URL del Botón"
              value={newsletter.ctaUrl}
              onChange={(e) => setNewsletter({...newsletter, ctaUrl: e.target.value})}
              placeholder="https://stmiranda.com/evento"
            />
          </div>
        </div>
      </Modal>

      {/* Result */}
      {sendResult && (
        <div className={`p-4 rounded-xl ${sendResult.success ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
          <div className="flex items-center gap-3">
            {sendResult.success ? (
              <CheckCircle className="text-emerald-400" size={24} />
            ) : (
              <AlertCircle className="text-red-400" size={24} />
            )}
            <div>
              <p className={`font-medium ${sendResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                {sendResult.success ? 'Newsletter enviado exitosamente' : 'Error al enviar'}
              </p>
              {sendResult.success && (
                <p className="text-sm text-gray-400">
                  Enviado a {sendResult.sent} fans
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailMarketing;
