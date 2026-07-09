'use client'
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

// 1. The Provider: Wrap your app with this
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      
      {/* 2. The Container: Positions the toasts on screen */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem 
            key={toast.id} 
            {...toast} 
            onClose={() => removeToast(toast.id)} 
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// 3. The Individual Toast UI
const ToastItem = ({ message, type, onClose }) => {
  const bgColors = {
    success: 'bg-emerald-500 text-white border-emerald-600',
    error: 'bg-rose-500 text-white border-rose-600',
    info: 'bg-sky-500 text-white border-sky-600',
    warning: 'bg-amber-500 text-white border-amber-600'
  };

  return (
    <div className={`pointer-events-auto flex items-center justify-between min-w-[300px] p-4 rounded-lg shadow-2xl animate-slide-in border-b-4 ${bgColors[type]}`}>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 hover:opacity-70 transition-opacity">
        ✕
      </button>
    </div>
  );
};

// 4. The Hook: Call this in your components
export const useToast = () => useContext(ToastContext);