/**
 * Fan Registration Modal
 * Modal popup para registro de fans (puede usarse en cualquier página)
 */
import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import FanRegistrationForm from './FanRegistrationForm';
import { X, Music, Heart } from 'lucide-react';

const FanRegistrationModal = ({ 
  isOpen, 
  onClose, 
  trigger = 'manual', // 'manual', 'exit-intent', 'time-delay', 'scroll'
  delay = 0 
}) => {
  const [showModal, setShowModal] = useState(isOpen);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    setShowModal(isOpen);
  }, [isOpen]);

  // Auto-trigger logic
  useEffect(() => {
    if (hasShown || trigger === 'manual') return;

    let timer;
    
    if (trigger === 'time-delay' && delay > 0) {
      timer = setTimeout(() => {
        setShowModal(true);
        setHasShown(true);
      }, delay);
    }

    if (trigger === 'exit-intent') {
      const handleMouseLeave = (e) => {
        if (e.clientY <= 0 && !hasShown) {
          setShowModal(true);
          setHasShown(true);
        }
      };
      document.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        document.removeEventListener('mouseleave', handleMouseLeave);
        clearTimeout(timer);
      };
    }

    return () => clearTimeout(timer);
  }, [trigger, delay, hasShown]);

  const handleClose = () => {
    setShowModal(false);
    onClose?.();
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      size="md"
      showCloseButton={true}
    >
      <FanRegistrationForm />
    </Modal>
  );
};

// Botón flotante para activar el modal
export const FanRegistrationButton = ({ 
  className = '',
  variant = 'floating',
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === 'floating') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`
            fixed bottom-24 right-6 z-40
            bg-gradient-to-r from-pink-500 to-violet-600
            text-white px-4 py-3 rounded-full shadow-lg shadow-pink-500/25
            hover:shadow-pink-500/40 hover:scale-105
            transition-all duration-300
            flex items-center gap-2
            ${className}
          `}
        >
          <Heart size={18} className="animate-pulse" />
          <span className="font-medium">Ser Fan</span>
        </button>
        <FanRegistrationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={className}>
        {children || (
          <>
            <Music size={18} className="mr-2" />
            Unirme a la Comunidad
          </>
        )}
      </button>
      <FanRegistrationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default FanRegistrationModal;
