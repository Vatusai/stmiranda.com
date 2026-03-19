/**
 * Clients Page
 * CRM con datos reales de la API - AHORA CON EDICIÓN
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  Calendar,
  FileText,
  Edit,
  Trash2,
  Loader2,
  X,
  Save
} from 'lucide-react';
import { clientsApi, eventsApi } from '../../services/api.js';
import { format } from '../../utils/formatters';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientEvents, setClientEvents] = useState([]);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Formulario de nuevo cliente
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    country: 'Costa Rica',
    event_type: 'Boda',
    status: 'new',
    notes: ''
  });

  // Formulario de edición
  const [editClient, setEditClient] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    city: '',
    country: 'Costa Rica',
    event_type: 'Boda',
    status: 'active',
    notes: ''
  });

  // Cargar clientes
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const data = await clientsApi.getAll(params);
      setClients(data.clients);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Ver detalle de cliente
  const handleViewClient = async (client) => {
    try {
      const [clientData, eventsData] = await Promise.all([
        clientsApi.getById(client.id),
        eventsApi.getAll({ client_id: client.id })
      ]);
      
      setSelectedClient(clientData.client);
      setClientEvents(eventsData.events);
      setIsClientModalOpen(true);
    } catch (err) {
      console.error('Error loading client details:', err);
    }
  };

  // Abrir modal de edición
  const handleOpenEdit = (client, e) => {
    e.stopPropagation();
    setEditClient({
      id: client.id,
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      city: client.city || '',
      country: client.country || 'Costa Rica',
      event_type: client.event_type || 'Boda',
      status: client.status || 'active',
      notes: client.notes || ''
    });
    setIsEditClientModalOpen(true);
  };

  // Guardar edición
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await clientsApi.update(editClient.id, {
        name: editClient.name,
        email: editClient.email,
        phone: editClient.phone,
        city: editClient.city,
        country: editClient.country,
        event_type: editClient.event_type,
        status: editClient.status,
        notes: editClient.notes
      });
      setIsEditClientModalOpen(false);
      fetchClients();
      // Si tenemos el modal de detalle abierto, actualizarlo
      if (isClientModalOpen && selectedClient?.id === editClient.id) {
        const updated = await clientsApi.getById(editClient.id);
        setSelectedClient(updated.client);
      }
    } catch (err) {
      console.error('Error updating client:', err);
      alert('Error al actualizar cliente: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Crear cliente
  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await clientsApi.create(newClient);
      setIsNewClientModalOpen(false);
      setNewClient({
        name: '', email: '', phone: '', city: '', country: 'Costa Rica',
        event_type: 'Boda', status: 'new', notes: ''
      });
      fetchClients();
    } catch (err) {
      console.error('Error creating client:', err);
      alert('Error al crear cliente: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar cliente
  const handleDeleteClient = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    
    try {
      await clientsApi.delete(id);
      setIsClientModalOpen(false);
      setIsEditClientModalOpen(false);
      fetchClients();
    } catch (err) {
      console.error('Error deleting client:', err);
      alert('Error al eliminar cliente: ' + err.message);
    }
  };

  // Columnas de la tabla con botón de editar
  const columns = [
    { key: 'name', title: 'Nombre', render: (value, row) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-violet-500/20 flex items-center justify-center">
          <span className="text-violet-400 font-medium">{value.charAt(0)}</span>
        </div>
        <div>
          <p className="font-medium text-white">{value}</p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'phone', title: 'Teléfono' },
    { key: 'event_type', title: 'Tipo' },
    { key: 'status', title: 'Estado', render: (value) => (
      <Badge variant={value} dot>
        {value === 'active' ? 'Activo' : value === 'new' ? 'Nuevo' : 'Inactivo'}
      </Badge>
    )},
    { key: 'events_count', title: 'Eventos' },
    { 
      key: 'actions', 
      title: 'Acciones', 
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => handleOpenEdit(row, e)}
            className="p-2 rounded-lg text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
            title="Editar"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClient(row.id);
            }}
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const activeClients = clients.filter(c => c.status === 'active').length;
  const newClients = clients.filter(c => c.status === 'new').length;
  const inactiveClients = clients.filter(c => c.status === 'inactive').length;

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={40} className="animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Base de Clientes</h1>
          <p className="text-gray-400 mt-1">Gestiona tus contactos y leads</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" leftIcon={<Download size={16} />}>
            Exportar
          </Button>
          <Button 
            variant="primary" 
            leftIcon={<Plus size={18} />}
            onClick={() => setIsNewClientModalOpen(true)}
          >
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-white">{clients.length}</p>
          <p className="text-sm text-gray-400">Total</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-emerald-400">{activeClients}</p>
          <p className="text-sm text-gray-400">Activos</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-blue-400">{newClients}</p>
          <p className="text-sm text-gray-400">Nuevos</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-gray-400">{inactiveClients}</p>
          <p className="text-sm text-gray-400">Inactivos</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500/50"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="new">Nuevos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <DataTable
          columns={columns}
          data={clients}
          keyExtractor={(row) => row.id}
          onRowClick={handleViewClient}
          loading={loading}
          emptyMessage="No se encontraron clientes"
        />
      </Card>

      {/* Client Detail Modal */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title={selectedClient?.name}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsClientModalOpen(false)}>
              Cerrar
            </Button>
            {selectedClient && (
              <>
                <Button 
                  variant="primary" 
                  leftIcon={<Edit size={16} />}
                  onClick={(e) => {
                    setIsClientModalOpen(false);
                    handleOpenEdit(selectedClient, e);
                  }}
                >
                  Editar
                </Button>
                <Button 
                  variant="danger" 
                  leftIcon={<Trash2 size={16} />}
                  onClick={() => selectedClient && handleDeleteClient(selectedClient.id)}
                >
                  Eliminar
                </Button>
              </>
            )}
          </>
        }
      >
        {selectedClient && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <span className="text-2xl text-violet-400 font-bold">
                    {selectedClient.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <Badge variant={selectedClient.status}>
                    {selectedClient.status === 'active' ? 'Activo' : 
                     selectedClient.status === 'new' ? 'Nuevo' : 'Inactivo'}
                  </Badge>
                  <p className="text-sm text-gray-400 mt-1">
                    Cliente desde {format.date(selectedClient.first_contact)}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                {selectedClient.email && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail size={18} className="text-violet-400" />
                    <span>{selectedClient.email}</span>
                  </div>
                )}
                {selectedClient.phone && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone size={18} className="text-violet-400" />
                    <span>{selectedClient.phone}</span>
                  </div>
                )}
                {(selectedClient.city || selectedClient.country) && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin size={18} className="text-violet-400" />
                    <span>{[selectedClient.city, selectedClient.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {selectedClient.event_type && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Calendar size={18} className="text-violet-400" />
                    <span>{selectedClient.event_type}</span>
                  </div>
                )}
              </div>

              {selectedClient.notes && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                    <FileText size={16} />
                    Notas
                  </h4>
                  <p className="text-sm text-gray-400">{selectedClient.notes}</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-white mb-3">Historial de Eventos ({clientEvents.length})</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {clientEvents.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay eventos registrados</p>
                ) : (
                  clientEvents.map((event) => (
                    <div key={event.id} className="p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white text-sm">{event.title}</span>
                        <Badge variant={event.status} size="xs">
                          {event.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">{format.date(event.date)}</p>
                      {event.budget > 0 && (
                        <p className="text-xs text-emerald-400 mt-1">
                          ${event.budget.toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* New Client Modal */}
      <Modal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        title="Nuevo Cliente"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsNewClientModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary"
              leftIcon={<Save size={18} />}
              onClick={handleCreateClient}
              loading={isSubmitting}
            >
              Guardar Cliente
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateClient} className="space-y-4">
          <Input 
            label="Nombre completo *"
            value={newClient.name}
            onChange={(e) => setNewClient({...newClient, name: e.target.value})}
            required
          />
          <Input 
            label="Correo electrónico"
            type="email"
            value={newClient.email}
            onChange={(e) => setNewClient({...newClient, email: e.target.value})}
          />
          <Input 
            label="Teléfono"
            value={newClient.phone}
            onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Ciudad"
              value={newClient.city}
              onChange={(e) => setNewClient({...newClient, city: e.target.value})}
            />
            <Input 
              label="País"
              value={newClient.country}
              onChange={(e) => setNewClient({...newClient, country: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de evento</label>
            <select 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
              value={newClient.event_type}
              onChange={(e) => setNewClient({...newClient, event_type: e.target.value})}
            >
              <option value="Boda">Boda</option>
              <option value="Corporativo">Corporativo</option>
              <option value="Cumpleaños">Cumpleaños</option>
              <option value="Graduación">Graduación</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notas</label>
            <textarea 
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
              placeholder="Información adicional..."
              value={newClient.notes}
              onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Client Modal */}
      <Modal
        isOpen={isEditClientModalOpen}
        onClose={() => setIsEditClientModalOpen(false)}
        title="Editar Cliente"
        size="lg"
        footer={
          <>
            <Button 
              variant="danger" 
              leftIcon={<Trash2 size={16} />}
              onClick={() => handleDeleteClient(editClient.id)}
            >
              Eliminar
            </Button>
            <Button variant="ghost" onClick={() => setIsEditClientModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary"
              leftIcon={<Save size={18} />}
              onClick={handleSaveEdit}
              loading={isSubmitting}
            >
              Guardar Cambios
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Nombre completo *"
              value={editClient.name}
              onChange={(e) => setEditClient({...editClient, name: e.target.value})}
              required
            />
            <Input 
              label="Correo electrónico"
              type="email"
              value={editClient.email}
              onChange={(e) => setEditClient({...editClient, email: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Teléfono"
              value={editClient.phone}
              onChange={(e) => setEditClient({...editClient, phone: e.target.value})}
            />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                value={editClient.status}
                onChange={(e) => setEditClient({...editClient, status: e.target.value})}
              >
                <option value="active">Activo</option>
                <option value="new">Nuevo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Ciudad"
              value={editClient.city}
              onChange={(e) => setEditClient({...editClient, city: e.target.value})}
            />
            <Input 
              label="País"
              value={editClient.country}
              onChange={(e) => setEditClient({...editClient, country: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de evento</label>
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                value={editClient.event_type}
                onChange={(e) => setEditClient({...editClient, event_type: e.target.value})}
              >
                <option value="Boda">Boda</option>
                <option value="Corporativo">Corporativo</option>
                <option value="Cumpleaños">Cumpleaños</option>
                <option value="Graduación">Graduación</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Notas</label>
            <textarea 
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
              placeholder="Información adicional sobre el cliente..."
              value={editClient.notes}
              onChange={(e) => setEditClient({...editClient, notes: e.target.value})}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clients;
