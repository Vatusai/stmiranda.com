/**
 * Google Calendar Integration Component
 * Service Account mode - No OAuth required
 * 
 * Displays connection status and provides sync functionality
 * for the configured Service Account calendar.
 */
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  RefreshCw, 
  ExternalLink,
  AlertCircle,
  Loader2,
  Server,
  Settings,
  Info
} from 'lucide-react';
import { calendarApi } from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const GoogleCalendarIntegration = () => {
  const [status, setStatus] = useState({ 
    connected: false,
    mode: 'service_account',
    calendarId: null,
    calendarName: null,
    error: null,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const data = await calendarApi.getStatus();
      setStatus(data);
    } catch (err) {
      console.error('Error checking calendar status:', err);
      setStatus({
        connected: false,
        mode: 'service_account',
        error: err.message || 'Error checking connection',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!status.connected) {
      return;
    }
    
    try {
      setSyncing(true);
      const result = await calendarApi.importEvents({
        timeMin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        timeMax: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      });
      
      setLastSync(new Date());
      
      if (result.imported === 0) {
        alert('No new events found to import');
      } else {
        alert(`✅ ${result.imported} event(s) imported of ${result.total} found`);
      }
    } catch (err) {
      console.error('Error syncing:', err);
      alert('Error syncing: ' + (err.message || 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-violet-400" size={32} />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${status.connected ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
              <Server size={28} className={status.connected ? 'text-emerald-400' : 'text-amber-400'} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Google Calendar</h3>
              <p className="text-sm text-gray-400 mt-1">
                Service Account Integration
              </p>
            </div>
          </div>
          
          <Badge 
            variant={status.connected ? 'success' : 'warning'}
            dot
          >
            {status.connected ? 'Connected' : 'Not Configured'}
          </Badge>
        </div>

        {/* CONFIGURATION INFO */}
        <div className="mt-6 p-4 bg-violet-500/5 border border-violet-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Info size={18} className="text-violet-400 mt-0.5" />
            <div>
              <p className="text-sm text-violet-400 font-medium">Service Account Mode</p>
              <p className="text-sm text-gray-400 mt-1">
                This integration uses a Google Service Account with a dedicated calendar. 
                No OAuth login required. Events are synced to a pre-configured calendar.
              </p>
            </div>
          </div>
        </div>

        {/* CONNECTION STATUS */}
        {status.connected ? (
          <div className="mt-6 space-y-4">
            {/* Calendar Info */}
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <p className="text-xs text-emerald-500 uppercase tracking-wider mb-3">Connected Calendar</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Name</span>
                  <span className="text-sm text-white font-medium">{status.calendarName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Calendar ID</span>
                  <code className="text-xs text-gray-500 font-mono bg-black/30 px-2 py-1 rounded">
                    {status.calendarId}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Timezone</span>
                  <span className="text-sm text-gray-300">{status.timezone}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                leftIcon={syncing ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />}
                onClick={handleSync}
                loading={syncing}
              >
                {syncing ? 'Importing...' : 'Import from Google'}
              </Button>
              
              <Button
                variant="ghost"
                leftIcon={<ExternalLink size={18} />}
                onClick={() => window.open(`https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(status.calendarId)}`, '_blank')}
              >
                Open in Google Calendar
              </Button>
              
              <Button
                variant="ghost"
                leftIcon={<Settings size={18} />}
                onClick={checkStatus}
              >
                Refresh Status
              </Button>
            </div>

            {lastSync && (
              <p className="text-xs text-gray-500">
                Last sync: {lastSync.toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {/* Not Connected Error */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-amber-400 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-400 font-medium">Not Configured</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {status.error || 'Service Account is not properly configured.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Setup Instructions */}
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-sm font-medium text-white mb-3">Setup Required:</p>
              <ol className="space-y-2 text-sm text-gray-400 list-decimal list-inside">
                <li>Create a Google Service Account in Google Cloud Console</li>
                <li>Download the JSON key file</li>
                <li>Create a dedicated Google Calendar and share it with the Service Account email</li>
                <li>Add these variables to <code className="bg-black/30 px-1 rounded">backend/.env</code>:
                  <code className="block mt-2 p-2 bg-black/30 rounded text-xs font-mono text-gray-500">
                    GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./config/service-account-key.json<br/>
                    GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
                  </code>
                </li>
                <li>Restart the backend server</li>
              </ol>
            </div>
          </div>
        )}

        {/* FEATURES INFO */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Features:</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" />
              Automatic sync of confirmed bookings to Google Calendar
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" />
              Import existing events from the configured calendar
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size="14" className="text-emerald-400" />
              Email reminders (24h and 1h before events)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" />
              No user login required - backend-only authentication
            </li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default GoogleCalendarIntegration;
