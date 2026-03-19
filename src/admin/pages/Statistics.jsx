/**
 * Statistics Page
 * Dashboard de estadísticas y métricas del negocio
 */
import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import StatsCard from '../../components/ui/StatsCard';
import { mockStats } from '../../utils/mockData';
import { format } from '../../utils/formatters';
import { 
  TrendingUp, 
  Users, 
  MousePointerClick, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Music
} from 'lucide-react';

const Statistics = () => {
  const [timeRange, setTimeRange] = useState('30d');

  // Gráfico simple de barras para visitas
  const BarChart = ({ data, color = 'violet' }) => {
    const max = Math.max(...data.map(d => d.value));
    return (
      <div className="flex items-end gap-2 h-40">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div 
              className={`w-full bg-${color}-500/50 rounded-t-md transition-all duration-500`}
              style={{ height: `${(item.value / max) * 100}%` }}
            />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  // Gráfico de líneas simple
  const LineChart = ({ data }) => {
    const max = Math.max(...data.map(d => d.value));
    const min = Math.min(...data.map(d => d.value));
    const range = max - min || 1;
    
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d.value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 100 100" className="w-full h-40" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
          </linearGradient>
        </defs>
        <polygon 
          points={`0,100 ${points} 100,100`} 
          fill="url(#lineGradient)"
        />
        <polyline
          points={points}
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Donut chart para distribución
  const DonutChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
          {data.map((item, index) => {
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = ((startAngle + angle) * Math.PI) / 180;
            
            const x1 = 50 + 40 * Math.cos(startRad);
            const y1 = 50 + 40 * Math.sin(startRad);
            const x2 = 50 + 40 * Math.cos(endRad);
            const y2 = 50 + 40 * Math.sin(endRad);
            
            const largeArc = angle > 180 ? 1 : 0;
            
            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={item.color}
                stroke="#1A1A2E"
                strokeWidth="2"
              />
            );
          })}
          <circle cx="50" cy="50" r="25" fill="#1A1A2E" />
        </svg>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-400">{item.label}</span>
              <span className="text-sm text-white font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const visitData = [
    { label: 'Ene', value: 850 },
    { label: 'Feb', value: 920 },
    { label: 'Mar', value: 1234 },
    { label: 'Abr', value: 1100 },
    { label: 'May', value: 980 },
    { label: 'Jun', value: 1150 },
  ];

  const revenueData = [
    { value: 8500 },
    { value: 10200 },
    { value: 12500 },
    { value: 11800 },
    { value: 13200 },
    { value: 14500 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Estadísticas</h1>
          <p className="text-gray-400 mt-1">Métricas y análisis de tu negocio</p>
        </div>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white"
        >
          <option value="7d">Últimos 7 días</option>
          <option value="30d">Últimos 30 días</option>
          <option value="90d">Últimos 3 meses</option>
          <option value="1y">Último año</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Visitas totales"
          value={format.number(mockStats.overview.totalVisits)}
          trend="up"
          trendValue="+12.5%"
          icon={Users}
          variant="info"
        />
        <StatsCard
          title="Nuevos leads"
          value={format.number(mockStats.overview.newLeads)}
          trend="up"
          trendValue="+8.3%"
          icon={MousePointerClick}
          variant="default"
        />
        <StatsCard
          title="Eventos confirmados"
          value={format.number(mockStats.overview.confirmedEvents)}
          icon={Calendar}
          variant="success"
        />
        <StatsCard
          title="Tasa de conversión"
          value={`${mockStats.overview.conversionRate}%`}
          trend="up"
          trendValue="+2.1%"
          icon={TrendingUp}
          variant="primary"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitas */}
        <Card>
          <Card.Header>
            <Card.Title>Visitas a la web</Card.Title>
            <Card.Subtitle>Tendencia de tráfico mensual</Card.Subtitle>
          </Card.Header>
          <BarChart data={visitData} />
        </Card>

        {/* Eventos por tipo */}
        <Card>
          <Card.Header>
            <Card.Title>Tipos de evento</Card.Title>
            <Card.Subtitle>Distribución de servicios contratados</Card.Subtitle>
          </Card.Header>
          <DonutChart 
            data={[
              { label: 'Bodas', value: 35, color: '#8B5CF6' },
              { label: 'Corporativos', value: 28, color: '#3B82F6' },
              { label: 'Sociales', value: 22, color: '#10B981' },
              { label: 'Otros', value: 15, color: '#F59E0B' },
            ]} 
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingresos */}
        <Card>
          <Card.Header>
            <Card.Title>Ingresos mensuales</Card.Title>
            <Card.Subtitle>Evolución de facturación</Card.Subtitle>
          </Card.Header>
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-3xl font-bold text-white">
                {format.currency(mockStats.overview.monthlyRevenue)}
              </p>
              <div className="flex items-center gap-1 text-emerald-400 mt-1">
                <ArrowUpRight size={16} />
                <span className="text-sm">+{mockStats.overview.revenueGrowth}% vs mes anterior</span>
              </div>
            </div>
          </div>
          <LineChart data={revenueData} />
        </Card>

        {/* Origen de visitas */}
        <Card>
          <Card.Header>
            <Card.Title>Origen de visitas</Card.Title>
            <Card.Subtitle>Geografía de tus visitantes</Card.Subtitle>
          </Card.Header>
          <div className="space-y-4">
            {mockStats.visitsByCountry.map((country, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="text-2xl">{country.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{country.country}</span>
                    <span className="text-sm font-medium text-white">{country.percentage}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Estado de leads */}
      <Card>
        <Card.Header>
          <Card.Title>Embudo de conversión</Card.Title>
          <Card.Subtitle>Estado de leads en el pipeline</Card.Subtitle>
        </Card.Header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockStats.leadStatus.map((status, index) => (
            <div key={index} className="text-center p-4 bg-white/5 rounded-xl">
              <p className="text-3xl font-bold" style={{ color: status.color }}>
                {status.count}
              </p>
              <p className="text-sm text-gray-400 mt-1">{status.status}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Statistics;
