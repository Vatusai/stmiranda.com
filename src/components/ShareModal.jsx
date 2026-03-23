/**
 * ShareModal
 * Shows the event link so the user can copy and share it manually.
 */
import React, { useState } from 'react';
import { X, Copy, Check, Link2 } from 'lucide-react';

const ShareModal = ({ event, url, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement('input');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Compartir evento</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Event preview */}
        <div className="mb-5 flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
          {event.flyer_url ? (
            <img
              src={event.flyer_url}
              alt={event.title}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-violet-600/30 flex items-center justify-center flex-shrink-0">
              <Link2 size={16} className="text-violet-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white font-medium text-sm leading-tight line-clamp-1">{event.title}</p>
            <p className="text-gray-500 text-xs mt-0.5 truncate">{url}</p>
          </div>
        </div>

        {/* Copy link */}
        <button
          onClick={handleCopy}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
            ${copied
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
            }`}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? '¡Enlace copiado!' : 'Copiar enlace'}
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
