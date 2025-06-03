
import React from 'react';
import { AlertTriangleIcon } from './icons'; // Assuming icons.tsx

interface WarningModalProps {
  title: string;
  message: string;
  onClose: () => void;
}

export const WarningModal: React.FC<WarningModalProps> = ({ title, message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 p-6 md:p-8 rounded-lg shadow-xl max-w-md w-full border border-yellow-500/50">
        <div className="flex items-center mb-4">
            <AlertTriangleIcon className="w-10 h-10 text-yellow-400 mr-4" />
            <h2 className="text-2xl font-bold text-yellow-400">{title}</h2>
        </div>
        <p className="text-slate-300 mb-6 text-sm">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold py-2.5 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          Acknowledge & Return
        </button>
      </div>
    </div>
  );
};
