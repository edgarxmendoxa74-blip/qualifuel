import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-quali-primary" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-quali-primary/10 border-quali-primary/20',
    error: 'bg-red-500/10 border-red-500/20',
    info: 'bg-blue-500/10 border-blue-500/20'
  };

  return (
    <div className={`fixed bottom-8 right-8 z-[200] flex items-center space-x-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform ${isExiting ? 'opacity-0 translate-y-4 scale-95' : 'animate-fade-in-up'} ${bgColors[type]}`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <p className="text-white text-xs font-black uppercase tracking-widest">
        {message}
      </p>
      <button onClick={handleClose} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
        <X className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
};

export default Toast;
