/**
 * Contacts Page
 * Gestión de contactos (Community Layer)
 * Fans, leads, clientes - la base de la comunidad
 */
import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { 
  Search, 
  Plus, 
  Download,
  Mail,
  Phone,
  MapPin,
  Heart,
  UserPlus,
  Edit,
  Trash2,
  Loader2,
  Filter,
  Music,
  Star,
  Users,
  ArrowRight
} from 'lucide-react';
import { contactsApi, inquiriesApi, eventsApi } from '../../services/api.js';
import { Link } from 'react-router-dom';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [relationshipFilter, setRelationshipFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactInquiries, setContactInquiries] = useState([]);
  const [contactEvents, setContactEvents] = useState([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Formularios
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    country: 'Costa Rica',
    relationship_type: 'fan',
    wants_concert_updates: true,
    wants_private_event_info: true,
    source: 'manual',
    notes: ''
  });

  const [editContact, setEditContact] = useState({});

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (relationshipFilter !== 'all') params.relationship_type = relationshipFilter;
      if (sourceFilter !== 'all') params.source = sourceFilter;
      
      const data = await contactsApi.getAll(params);
      setContacts(data.contacts);
      setStats(data.counts || {});
    } catch (err) {
      console.error('Error loading contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, relationshipFilter, sourceFilter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleViewContact = async (contact) => {
    try {
      const data = await contactsApi.getById(contact.id);
      setSelectedContact(data.contact);
      setContactInquiries(data.inquiries || []);
      setContactEvents(data.events || []);
      setIsContactModalOpen(true);
    } catch (err) {
      console.error('Error loading contact details:', err);
    }
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await contactsApi.create(newContact);
      setIsNewContactModalOpen(false);
      setNewContact({
        name: '', email: '', phone: '', city: '', country: 'Costa Rica',
        relationship_type: 'fan', wants_concert_updates: true,
        wants_private_event_info: true, source: 'manual', notes: ''
      });
      fetchContacts();
    } catch (err) {
      console.error('Error creating contact:', err);
      alert('Error al crear contacto: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await contactsApi.update(editContact.id, editContact);
      setIsEditModalOpen(false);
      fetchContacts();
      if (selectedContact?.id === editContact.id) {
        const updated = await contactsApi.getById(editContact.id);
        setSelectedContact(updated.contact);
      }
    } catch (err) {
      console.error('Error updating contact:', err);
      alert('Error al actualizar: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContact = async (id) => {
    if (!confirm('¿Eliminar este contacto permanentemente?')) return;
    try {
      await contactsApi.delete(id);
      setIsContactModalOpen(false);
      setIsEditModalOpen(false);
      fetchContacts();
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  const openEditModal = (contact, e) => {
    e?.stopPropagation();
    setEditContact({ ...contact });
    setIsEditModalOpen(true);
  };

  // Relación tipos con colores e iconos
  const relationshipConfig = {
    fan: { label: 'Fan', color: 'pink', icon: Heart },
    lead: { label: 'Lead', color: 'blue', icon: UserPlus },
    client: { label: 'Cliente', color: 'emerald', icon: Star },
    fan_lead: { label: 'Fan + Lead', color: 'violet', icon: Users },
    alumni: { label: 'Alumni', color: 'gray', icon: Users }
  };

  const columns = [
    { 
      key: 'name', 
      title: 'Nombre', 
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-violet-400 font-bold">{value.charAt(0)}</span>
          </div>
          <div>
            <p className="font-medium text-white">{value}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      )
    },
    { key: 'phone', title: 'Teléfono' },
    { key: 'city', title: 'Ciudad' },
    { 
      key: 'relationship_type', 
      title: 'Tipo', 
      render: (value) => {
        const config = relationshipConfig[value] || relationshipConfig.lead;
        const Icon = config.icon;
        return (
          <Badge variant={config.color}>
            <Icon size={12} className="mr-1" />
            {config.label}
          </Badge>
        );
      }
    },
    { 
      key: 'wants_concert_updates', 
      title: 'Conciertos', 
      render: (value) => value ? (
        <span className="text-pink-400">♪ Sí</span>
      ) : (
        <span className="text-gray-600">—</span>
      )
    },
    { 
      key: 'actions', 
      title: '',
      render: (_, row) => (
        <div className="flex gap-2">
          <button 
            onClick={(e) => openEditModal(row, e)}
            className="p-2 rounded-lg text-gray-400 hover:text-violet-400 hover:bg-violet-500/10"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDeleteContact(row.id); }}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10"
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
          <h1 className="text-2xl font-bold text-white">Contactos</h1>
          <p className="text-gray-400 mt-1">Fans, leads y comunidad</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={<Download size={18} />}>
            Exportar
          </Button>
          <Button 
            variant="primary" 
            leftIcon={<Plus size={18} />}
            onClick={() => setIsNewContactModalOpen(true)}
          >
            Nuevo Contacto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { key: 'fan', label: 'Fans', icon: Heart, color: 'pink' },
          { key: 'lead', label: 'Leads', icon: UserPlus, color: 'blue' },
          { key: 'client', label: 'Clientes', icon: Star, color: 'emerald' },
          { key: 'fan_lead', label: 'Fan+Lead', icon: Users, color: 'violet' },
          { key: 'total', label: 'Total', icon: Users, color: 'gray' }
        ].map(({ key, label, icon: Icon, color }) => (
          <Card 
            key={key} 
            padding="sm" 
            className={`cursor-pointer transition-all ${relationshipFilter === key ? 'ring-2 ring-violet-500' : ''}`}
            onClick={() => setRelationshipFilter(key === 'total' ? 'all' : key)}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${color}-500/10`}>
                <Icon size={20} className={`text-${color}-400`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {key === 'total' ? contacts.length : (stats[key] || 0)}
                </p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar contactos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
          />
        </div>
        <select
          value={relationshipFilter}
          onChange={(e) => setRelationshipFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500/50"
        >
          <option value="all">Todos los tipos</option>
          <option value="fan">Fan</option>
          <option value="lead">Lead</option>
          <option value="client">Cliente</option>
          <option value="fan_lead">Fan + Lead</option>
          <option value="alumni">Alumni</option>
        </select>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <Link to="/admin/inquiries">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>
            Ver Pipeline de Cotizaciones
          </Button>
        </Link>
      </div>

      {/* Table */}
      <Card>
        <DataTable
          columns={columns}
          data={contacts}
          keyExtractor={(row) => row.id}
          onRowClick={handleViewContact}
          loading={loading}
          emptyMessage="No se encontraron contactos"
        />
      </Card>

      {/* Contact Detail Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title={selectedContact?.name}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsContactModalOpen(false)}>Cerrar</Button>
            {selectedContact && (
              <>
                <Link to={`/admin/inquiries?contact=${selectedContact.id}`}>
                  <Button variant="secondary">Ver Cotizaciones</Button>
                </Link>
                <Button 
                  variant="primary" 
                  leftIcon={<Edit size={16} />}
                  onClick={() => { setIsContactModalOpen(false); openEditModal(selectedContact); }}
                >
                  Editar
                </Button>
              </>
            )}
          </>
        }
      >
        {selectedContact && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {selectedContact.name.charAt(0)}
                </span>
              </div>
              <div>
                {(() => {
                  const config = relationshipConfig[selectedContact.relationship_type] || relationshipConfig.lead;
                  return (
                    <Badge variant={config.color} size="lg">
                      <config.icon size={14} className="mr-1" />
                      {config.label}
                    </Badge>
                  );
                })()}
                <p className="text-sm text-gray-400 mt-1">
                  En el sistema desde {new Date(selectedContact.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {selectedContact.email && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail size={18} className="text-violet-400" />
                  <span>{selectedContact.email}</span>
                </div>
              )}
              {selectedContact.phone && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone size={18} className="text-violet-400" />
                  <span>{selectedContact.phone}</span>
                </div>
              )}
              {(selectedContact.city || selectedContact.country) && (
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin size={18} className="text-violet-400" />
                  <span>{[selectedContact.city, selectedContact.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <div className={`px-4 py-2 rounded-lg ${selectedContact.wants_concert_updates ? 'bg-pink-500/20 text-pink-400' : 'bg-gray-500/20 text-gray-400'}`}>
                <Music size={16} className="inline mr-2" />
                {selectedContact.wants_concert_updates ? 'Quiere updates de conciertos' : 'No quiere updates'}
              </div>
            </div>

            {/* Historial */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-medium text-white mb-3">Historial</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-2xl font-bold text-white">{contactInquiries.length}</p>
                  <p className="text-sm text-gray-400">Cotizaciones</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-2xl font-bold text-white">{contactEvents.length}</p>
                  <p className="text-sm text-gray-400">Eventos confirmados</p>
                </div>
              </div>
            </div>

            {selectedContact.notes && (
              <div className="p-4 bg-white/5 rounded-xl">
                <h4 className="text-sm font-medium text-white mb-2">Notas</h4>
                <p className="text-gray-400">{selectedContact.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* New Contact Modal */}
      <Modal
        isOpen={isNewContactModalOpen}
        onClose={() => setIsNewContactModalOpen(false)}
        title="Nuevo Contacto"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsNewContactModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleCreateContact} loading={isSubmitting}>
              Guardar Contacto
            </Button>
          </>
        }
      >
        <ContactForm contact={newContact} setContact={setNewContact} />
      </Modal>

      {/* Edit Contact Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Contacto"
        footer={
          <>
            <Button variant="danger" leftIcon={<Trash2 size={16} />} onClick={() => handleDeleteContact(editContact.id)}>
              Eliminar
            </Button>
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleUpdateContact} loading={isSubmitting}>
              Guardar Cambios
            </Button>
          </>
        }
      >
        <ContactForm contact={editContact} setContact={setEditContact} isEdit />
      </Modal>
    </div>
  );
};

// Formulario de contacto reutilizable
const ContactForm = ({ contact, setContact, isEdit }) => (
  <form className="space-y-4">
    <Input 
      label="Nombre completo *"
      value={contact.name || ''}
      onChange={(e) => setContact({...contact, name: e.target.value})}
      required
    />
    <div className="grid grid-cols-2 gap-4">
      <Input 
        label="Correo electrónico"
        type="email"
        value={contact.email || ''}
        onChange={(e) => setContact({...contact, email: e.target.value})}
      />
      <Input 
        label="Teléfono"
        value={contact.phone || ''}
        onChange={(e) => setContact({...contact, phone: e.target.value})}
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <Input 
        label="Ciudad"
        value={contact.city || ''}
        onChange={(e) => setContact({...contact, city: e.target.value})}
      />
      <Input 
        label="País"
        value={contact.country || ''}
        onChange={(e) => setContact({...contact, country: e.target.value})}
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de relación</label>
      <select 
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
        value={contact.relationship_type || 'fan'}
        onChange={(e) => setContact({...contact, relationship_type: e.target.value})}
      >
        <option value="fan">Fan (solo comunidad)</option>
        <option value="lead">Lead (interesado en evento)</option>
        <option value="client">Cliente (ha contratado)</option>
        <option value="fan_lead">Fan + Lead (ambos)</option>
        <option value="alumni">Alumni (cliente anterior)</option>
      </select>
    </div>
    <div className="flex gap-4">
      <label className="flex items-center gap-2 text-gray-300">
        <input 
          type="checkbox" 
          checked={contact.wants_concert_updates || false}
          onChange={(e) => setContact({...contact, wants_concert_updates: e.target.checked})}
          className="rounded border-white/20"
        />
        <Music size={16} />
        Quiere updates de conciertos
      </label>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Origen</label>
      <select 
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
        value={contact.source || 'manual'}
        onChange={(e) => setContact({...contact, source: e.target.value})}
      >
        <option value="manual">Registro manual</option>
        <option value="website">Sitio web</option>
        <option value="instagram">Instagram</option>
        <option value="facebook">Facebook</option>
        <option value="referral">Referido</option>
        <option value="event">Evento público</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Notas</label>
      <textarea 
        rows={3}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
        value={contact.notes || ''}
        onChange={(e) => setContact({...contact, notes: e.target.value})}
      />
    </div>
  </form>
);

export default Contacts;
