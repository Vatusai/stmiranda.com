/**
 * Exports Page
 * Exportación de datos por segmentos
 */
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { 
  Download, 
  Users, 
  Heart, 
  ClipboardList,
  Star,
  Filter,
  FileText,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { contactsApi } from '../../services/api';

const Exports = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);
  const [segmentConfig, setSegmentConfig] = useState({
    relationship_types: [],
    wants_concert_updates: true,
    city: '',
    source: ''
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await contactsApi.getAll({ limit: 1 });
      setStats(data.counts || {});
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    setExporting(type);
    
    try {
      let url = `/api/exports/${type}?format=csv`;
      
      if (type === 'segment') {
        // Para segmento personalizado, usar POST
        const response = await fetch('/api/exports/segment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...segmentConfig, format: 'csv' }),
          credentials: 'include'
        });
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `segmento_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
      } else {
        // Para exports predefinidos, usar GET
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Error al exportar');
    } finally {
      setTimeout(() => setExporting(null), 1000);
    }
  };

  const exportOptions = [
    {
      id: 'fans',
      title: 'Fans Suscritos',
      description: 'Contactos que quieren recibir updates de conciertos',
      icon: Heart,
      color: 'pink',
      count: stats?.fan || 0
    },
    {
      id: 'leads',
      title: 'Leads Activos',
      description: 'Cotizaciones en estado Nuevo o Pendiente',
      icon: ClipboardList,
      color: 'violet',
      count: '—'
    },
    {
      id: 'clients',
      title: 'Clientes Confirmados',
      description: 'Contactos con eventos confirmados',
      icon: Star,
      color: 'emerald',
      count: stats?.client || 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Exportar Datos</h1>
        <p className="text-gray-400 mt-1">Descarga listas segmentadas para marketing</p>
      </div>

      {/* Predefined Exports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card key={option.id} className="hover:border-white/20 transition-colors">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`p-3 bg-${option.color}-500/10 rounded-xl`}>
                    <Icon size={24} className={`text-${option.color}-400`} />
                  </div>
                  <Badge variant="secondary">{option.count} registros</Badge>
                </div>
                <h3 className="text-lg font-semibold text-white mt-4">{option.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                <Button
                  variant="secondary"
                  fullWidth
                  className="mt-4"
                  leftIcon={exporting === option.id ? <Loader2 className="animate-spin" /> : <Download />}
                  onClick={() => handleExport(option.id)}
                  loading={exporting === option.id}
                >
                  Exportar CSV
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Custom Segment */}
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-violet-400" />
            <Card.Title>Segmento Personalizado</Card.Title>
          </div>
          <Card.Subtitle>Crea una lista filtrada según tus criterios</Card.Subtitle>
        </Card.Header>
        
        <div className="space-y-4">
          {/* Relationship Types */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipos de Contacto</label>
            <div className="flex flex-wrap gap-2">
              {['fan', 'lead', 'client', 'fan_lead', 'alumni'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    const types = segmentConfig.relationship_types;
                    if (types.includes(type)) {
                      setSegmentConfig({
                        ...segmentConfig,
                        relationship_types: types.filter(t => t !== type)
                      });
                    } else {
                      setSegmentConfig({
                        ...segmentConfig,
                        relationship_types: [...types, type]
                      });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    segmentConfig.relationship_types.includes(type)
                      ? 'bg-violet-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {type === 'fan' && 'Fan'}
                  {type === 'lead' && 'Lead'}
                  {type === 'client' && 'Cliente'}
                  {type === 'fan_lead' && 'Fan + Lead'}
                  {type === 'alumni' && 'Alumni'}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={segmentConfig.wants_concert_updates}
                onChange={(e) => setSegmentConfig({...segmentConfig, wants_concert_updates: e.target.checked})}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500"
              />
              <span className="text-gray-300">Solo contactos que quieren updates de conciertos</span>
            </label>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ciudad</label>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                placeholder="Ej: San José"
                value={segmentConfig.city}
                onChange={(e) => setSegmentConfig({...segmentConfig, city: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Origen</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
                value={segmentConfig.source}
                onChange={(e) => setSegmentConfig({...segmentConfig, source: e.target.value})}
              >
                <option value="">Todos</option>
                <option value="website">Sitio web</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="referral">Referido</option>
                <option value="manual">Registro manual</option>
              </select>
            </div>
          </div>

          <Button
            variant="primary"
            leftIcon={exporting === 'segment' ? <Loader2 className="animate-spin" /> : <Download />}
            onClick={() => handleExport('segment')}
            loading={exporting === 'segment'}
          >
            Exportar Segmento Personalizado
          </Button>
        </div>
      </Card>

      {/* Info */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <FileText className="text-blue-400 mt-0.5" size={20} />
          <div>
            <p className="text-blue-400 font-medium">Formato CSV</p>
            <p className="text-sm text-gray-400 mt-1">
              Todos los exports se descargan en formato CSV compatible con Excel, Google Sheets,
              Mailchimp y otras plataformas de email marketing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exports;
