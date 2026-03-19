/**
 * Inquiries Page  
 * Pipeline comercial para eventos privados
 * Cotizaciones y solicitudes de booking
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { 
  Search, 
  Filter,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Edit,
  Trash2,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { inquiriesApi, contactsApi } from '../../services/api.js';

const Inquiries = () => {
  const [searchParams] = useSearchParams();
  const preselectedContact = searchParams.get('contact');
  
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contacts, setContacts] = useState([]);
  
  // Formulario nueva cotización
  const [newInquiry, setNewInquiry] = useState({
    contact_id: preselectedContact || '',
    event_type: 'Boda',
    event_date: '',
    event_time: '',
    location: '',
    guests: '',
    budget: '',
    message: '',
    notes: '',
    source: 'manual'
  });

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (preselectedContact) params.contact_id = preselectedContact;
      
      const data = await inquiriesApi.getAll(params);
      setInquiries(data.inquiries);
      setStats(data.stats || {});
    } catch (err) {
      console.error('Error loading inquiries:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, preselectedContact]);

  const fetchContacts = useCallback(async () => {
    try {
      const data = await contactsApi.getAll({ limit: 1000 });
      setContacts(data.contacts);
    } catch (err) {
      console.error('Error loading contacts:', err);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
    fetchContacts();
  }, [fetchInquiries, fetchContacts]);

  const handleCreateInquiry = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await inquiriesApi.create(newInquiry);
      setIsNewModalOpen(false);
      setNewInquiry({
        contact_id: '', event_type: 'Boda', event_date: '', event_time: '',
        location: '', guests: '', budget: '', message: '', notes: '', source: 'manual'
      });
      fetchInquiries();
    } catch (err) {
      console.error('Error creating inquiry:', err);
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await inquiriesApi.updateStatus(id, newStatus);
      fetchInquiries();
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error: ' + err.message);
    }
  };

  const handleConvertToEvent = async (inquiryId) => {
    try {
      const result = await inquiriesApi.convertToEvent(inquiryId, {});
      alert('✅ Convertido a evento: ' + result.event.title);
      fetchInquiries();
    } catch (err) {
      console.error('Error converting:', err);
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta cotización?')) return;
    try {
      await inquiriesApi.delete(id);
      setIsDetailModalOpen(false);
      fetchInquiries();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  // Configuración de estados
  const statusConfig = {
    nuevo: { label: 'Nuevo', color: 'blue', icon: Star },
    pendiente: { label: 'Pendiente', color: 'amber', icon: Clock },
    confirmado: { label: 'Confirmado', color: 'emerald', icon: CheckCircle },
    cancelado: { label: 'Cancelado', color: 'red', icon: XCircle },
    cerrado: { label: 'Cerrado', color: 'gray', icon: XCircle }
  };

  const pipelineColumns = [
    { 
      key: 'contact_name', 
      title: 'Cliente', 
      render: (value, row) => (
        <div>
          <p className="font-medium text-white">{value}</p>
          <p className="text-xs text-gray-500">{row.contact_email}</p>
        </div>
      )
    },
    { 
      key: 'event_type', 
      title: 'Tipo de Evento',
      render: (value) => (
        <span className="text-gray-300">{value || '—'}</span>
      )
    },
    { 
      key: 'event_date', 
      title: 'Fecha',
      render: (value) => value ? (
        <span className="text-gray-300">{new Date(value).toLocaleDateString()}</span>
      ) : '—'
    },
    { 
      key: 'budget', 
      title: 'Presupuesto',
      render: (value) => value ? (
        <span className="text-emerald-400">${value}</span>
      ) : '—'
    },
    { 
      key: 'status', 
      title: 'Estado',
      render: (value) => {
        const config = statusConfig[value] || statusConfig.nuevo;
        return (
          <Badge variant={config.color}>
            <config.icon size={12} className="mr-1" />
            {config.label}
          </Badge>
        );
      }
    },
    {
      key: 'actions',
      title: '',
      render: (_, row) => (
        <div className="flex gap-2">
          {row.status === 'nuevo' && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'pendiente'); }}
              className="p-2 rounded-lg text-amber-400 hover:bg-amber-500/10"
              title="Marcar como Pendiente"
            >
              <Clock size={16} />
            </button>
          )}
          {row.status === 'pendiente' && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleStatusChange(row.id, 'confirmado'); }}
              className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10"
              title="Confirmar"
            >
              <CheckCircle size={16} />
            </button>
          )}
          {row.status === 'confirmado' && !row.event_id && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleConvertToEvent(row.id); }}
              className="p-2 rounded-lg text-violet-400 hover:bg-violet-500/10"
              title="Crear Evento"
            >
              <Calendar size={16} />
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {preselectedContact && (
              <Link to="/admin/contacts">
                <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>
                  Volver a Contactos
                </Button>
              </Link>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">Cotizaciones</h1>
          <p className="text-gray-400 mt-1">Pipeline comercial para eventos privados</p>
        </div>

      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => (
          <Card 
            key={key}
            padding="sm" 
            className={`cursor-pointer transition-all ${statusFilter === key ? 'ring-2 ring-violet-500' : ''}`}
            onClick={() => setStatusFilter(key)}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${config.color}-500/10`}>
                <config.icon size={20} className={`text-${config.color}-400`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats[key]?.count || 0}</p>
                <p className="text-xs text-gray-400">{config.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Button 
          variant={statusFilter === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          Todas
        </Button>
        {Object.entries(statusConfig).map(([key, config]) => (
          <Button 
            key={key}
            variant={statusFilter === key ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setStatusFilter(key)}
          >
            {config.label}
          </Button>
        ))}
      </div>

      {/* Pipeline Board */}
      <Card>
        <DataTable
          columns={pipelineColumns}
          data={inquiries}
          keyExtractor={(row) => row.id}
          onRowClick={(row) => { setSelectedInquiry(row); setIsDetailModalOpen(true); }}
          loading={loading}
          emptyMessage="No hay cotizaciones en este estado"
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalle de Cotización"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)}>Cerrar</Button>
            {selectedInquiry && (
              <>
                {selectedInquiry.status !== 'confirmado' && (
                  <Button 
                    variant="primary"
                    onClick={() => handleStatusChange(selectedInquiry.id, 'confirmado')}
                  >
                    Confirmar
                  </Button>
                )}
                {selectedInquiry.status === 'confirmado' && !selectedInquiry.event_id && (
                  <Button 
                    variant="primary"
                    leftIcon={<Calendar size={16} />}
                    onClick={() => handleConvertToEvent(selectedInquiry.id)}
                  >
                    Crear Evento
                  </Button>
                )}
              </>
            )}
          </>
        }
      >
        {selectedInquiry && (
          <div className="space-y-6">
            {/* Estado */}
            <div className="flex items-center justify-between">
              {(() => {
                const config = statusConfig[selectedInquiry.status];
                return (
                  <Badge variant={config.color} size="lg">
                    <config.icon size={16} className="mr-2" />
                    {config.label}
                  </Badge>
                );
              })()}
              <select
                value={selectedInquiry.status}
                onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            {/* Cliente */}
            <div className="p-4 bg-white/5 rounded-xl">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Cliente</h4>
              <p className="text-lg font-medium text-white">{selectedInquiry.contact_name}</p>
              <p className="text-gray-400">{selectedInquiry.contact_email}</p>
              <p className="text-gray-500 text-sm">{selectedInquiry.contact_phone}</p>
            </div>

            {/* Detalles del Evento */}
            <div className="grid grid-cols-2 gap-4">
              {selectedInquiry.event_type && (
                <div>
                  <span className="text-gray-500 text-sm">Tipo</span>
                  <p className="text-white">{selectedInquiry.event_type}</p>
                </div>
              )}
              {selectedInquiry.event_date && (
                <div>
                  <span className="text-gray-500 text-sm">Fecha</span>
                  <p className="text-white">{new Date(selectedInquiry.event_date).toLocaleDateString()}</p>
                </div>
              )}
              {selectedInquiry.event_time && (
                <div>
                  <span className="text-gray-500 text-sm">Hora</span>
                  <p className="text-white">{selectedInquiry.event_time}</p>
                </div>
              )}
              {selectedInquiry.location && (
                <div className="col-span-2">
                  <span className="text-gray-500 text-sm">Ubicación</span>
                  <p className="text-white">{selectedInquiry.location}</p>
                </div>
              )}
              {selectedInquiry.guests && (
                <div>
                  <span className="text-gray-500 text-sm">Invitados</span>
                  <p className="text-white">{selectedInquiry.guests}</p>
                </div>
              )}
              {selectedInquiry.budget && (
                <div>
                  <span className="text-gray-500 text-sm">Presupuesto</span>
                  <p className="text-emerald-400 font-medium">{selectedInquiry.budget}</p>
                </div>
              )}
            </div>

            {/* Mensaje */}
            {selectedInquiry.message && (
              <div className="p-4 bg-white/5 rounded-xl">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Mensaje del cliente</h4>
                <p className="text-gray-300 italic">"{selectedInquiry.message}"</p>
              </div>
            )}

            {/* Notas internas */}
            {selectedInquiry.notes && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <h4 className="text-sm font-medium text-amber-400 mb-2">📝 Notas internas</h4>
                <p className="text-gray-300">{selectedInquiry.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* New Inquiry Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Nueva Cotización"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsNewModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleCreateInquiry} loading={isSubmitting}>
              Crear Cotización
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contacto *</label>
            <select
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
              value={newInquiry.contact_id}
              onChange={(e) => setNewInquiry({...newInquiry, contact_id: e.target.value})}
              required
            >
              <option value="">Seleccionar contacto...</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Evento</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                value={newInquiry.event_type}
                onChange={(e) => setNewInquiry({...newInquiry, event_type: e.target.value})}
              >
                <option value="Boda">Boda</option>
                <option value="Corporativo">Corporativo</option>
                <option value="Cumpleaños">Cumpleaños</option>
                <option value="Graduación">Graduación</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Fecha del Evento</label>
              <input
                type="date"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                value={newInquiry.event_date}
                onChange={(e) => setNewInquiry({...newInquiry, event_date: e.target.value})}
              />
            </div>
          </div>
          <Input 
            label="Ubicación"
            value={newInquiry.location}
            onChange={(e) => setNewInquiry({...newInquiry, location: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Invitados"
              value={newInquiry.guests}
              onChange={(e) => setNewInquiry({...newInquiry, guests: e.target.value})}
            />
            <Input 
              label="Presupuesto"
              value={newInquiry.budget}
              onChange={(e) => setNewInquiry({...newInquiry, budget: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mensaje del cliente</label>
            <textarea
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
              value={newInquiry.message}
              onChange={(e) => setNewInquiry({...newInquiry, message: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notas internas</label>
            <textarea
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
              value={newInquiry.notes}
              onChange={(e) => setNewInquiry({...newInquiry, notes: e.target.value})}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inquiries;
