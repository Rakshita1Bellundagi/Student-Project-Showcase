import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon-emerald" />;
      case 'error':
        return <AlertCircle size={18} className="toast-icon-rose" />;
      case 'warning':
        return <AlertTriangle size={18} className="toast-icon-amber" />;
      default:
        return <Info size={18} className="toast-icon-cyan" />;
    }
  };

  return (
    <div className={`toast-notification toast-${type} glass-panel animate-toast`}>
      <div className="toast-icon-wrap">{getIcon()}</div>
      <div className="toast-message-wrap">
        <p className="toast-message">{message}</p>
      </div>
      <button className="toast-close-btn" onClick={onClose} aria-label="Dismiss">
        <X size={15} />
      </button>
    </div>
  );
}
