/**
 * Settings Page
 * Configuración del sistema y perfil
 */
import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import GoogleCalendarIntegration from '../components/GoogleCalendarIntegration';
import { 
  User, 
  Bell, 
  Calendar, 
  Shield, 
  Save,
  Check,
  X,
  Mail,
  MessageCircle,
  Globe,
  Moon,
  Sun
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [savedMessage, setSavedMessage] = useState('');

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'integrations', label: 'Integraciones', icon: Calendar },
    { id: 'security', label: 'Seguridad', icon: Shield },
  ];

  const handleSave = () => {
    setSavedMessage('Cambios guardados exitosamente');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración</h1>
        <p className="text-gray-400 mt-1">Personaliza tu experiencia y gestiona tu cuenta</p>
      </div>

      {savedMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400">
          <Check size={20} />
          {savedMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <Card className="lg:col-span-1 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                    ${activeTab === tab.id 
                      ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-violet-400 border border-violet-500/20' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </Card>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <Card.Header>
                <Card.Title>Información del perfil</Card.Title>
                <Card.Subtitle>Actualiza tus datos personales</Card.Subtitle>
              </Card.Header>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {user?.name?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <div>
                    <Button variant="secondary" size="sm">
                      Cambiar foto
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG o GIF. Máximo 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Nombre completo" 
                    defaultValue={user?.name || 'Stephanie Miranda'}
                  />
                  <Input 
                    label="Correo electrónico" 
                    type="email"
                    defaultValue={user?.email || 'stephanie@stmiranda.com'}
                  />
                  <Input 
                    label="Teléfono" 
                    defaultValue="+506 7231-5028"
                  />
                  <Input 
                    label="Nombre del negocio" 
                    defaultValue="Stephanie Miranda Music"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Biografía</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50"
                    defaultValue="Directora musical y arreglista con más de 15 años de experiencia en eventos corporativos, bodas y conciertos."
                  />
                </div>

                <div className="flex justify-end">
                  <Button variant="primary" leftIcon={<Save size={18} />} onClick={handleSave}>
                    Guardar cambios
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <Card.Header>
                <Card.Title>Preferencias de notificaciones</Card.Title>
                <Card.Subtitle>Configura cómo y cuándo recibir alertas</Card.Subtitle>
              </Card.Header>

              <div className="space-y-6">
                {[
                  { id: 'email_leads', label: 'Nuevas solicitudes', desc: 'Recibir email cuando llegue un nuevo lead', checked: true },
                  { id: 'email_events', label: 'Recordatorios de eventos', desc: 'Alertas 24h antes de cada evento', checked: true },
                  { id: 'email_weekly', label: 'Resumen semanal', desc: 'Reporte de actividad cada lunes', checked: false },
                  { id: 'whatsapp_leads', label: 'WhatsApp - Nuevos leads', desc: 'Notificación instantánea por WhatsApp', checked: false },
                  { id: 'whatsapp_events', label: 'WhatsApp - Recordatorios', desc: 'Recordatorios de eventos por WhatsApp', checked: false },
                ].map((item) => (
                  <div key={item.id} className="flex items-start justify-between py-4 border-b border-white/5 last:border-0">
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-sm text-gray-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                    </label>
                  </div>
                ))}

                <div className="flex justify-end">
                  <Button variant="primary" leftIcon={<Save size={18} />} onClick={handleSave}>
                    Guardar preferencias
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-4">
              {/* Google Calendar */}
              <GoogleCalendarIntegration />

              {/* WhatsApp Business */}
              <Card>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                      <MessageCircle size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">WhatsApp Business</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Envía notificaciones y recibe mensajes de clientes
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-gray-500" />
                        <span className="text-xs text-gray-500">No conectado</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    Conectar
                  </Button>
                </div>
              </Card>

              {/* Analytics */}
              <Card>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                      <Globe size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Google Analytics</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Seguimiento detallado de visitas y comportamiento
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs text-emerald-400">Conectado</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Configurar
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <Card.Header>
                  <Card.Title>Cambiar contraseña</Card.Title>
                  <Card.Subtitle>Actualiza tu contraseña de acceso</Card.Subtitle>
                </Card.Header>
                <div className="space-y-4">
                  <Input type="password" label="Contraseña actual" placeholder="••••••••" />
                  <Input type="password" label="Nueva contraseña" placeholder="••••••••" />
                  <Input type="password" label="Confirmar nueva contraseña" placeholder="••••••••" />
                  <Button variant="primary">Actualizar contraseña</Button>
                </div>
              </Card>

              <Card>
                <Card.Header>
                  <Card.Title>Sesiones activas</Card.Title>
                  <Card.Subtitle>Dispositivos con acceso a tu cuenta</Card.Subtitle>
                </Card.Header>
                <div className="space-y-4">
                  {[
                    { device: 'Chrome en macOS', location: 'San José, Costa Rica', current: true, time: 'Ahora' },
                    { device: 'Safari en iPhone', location: 'San José, Costa Rica', current: false, time: 'Hace 2 días' },
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                      <div>
                        <p className="font-medium text-white flex items-center gap-2">
                          {session.device}
                          {session.current && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                              Actual
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-400">{session.location} • {session.time}</p>
                      </div>
                      {!session.current && (
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                          Cerrar sesión
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
