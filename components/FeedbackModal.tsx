import React from 'react';
import { X } from 'lucide-react';
import { Theme } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  theme
}) => {
  if (!isOpen) return null;

  const isNeon = theme === 'neon';
  const modalBg = isNeon ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-2xl h-[80vh] flex flex-col ${modalBg} border shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200 overflow-hidden`}>
        <div className={`p-4 flex items-center justify-between border-b ${isNeon ? 'border-slate-800' : 'border-slate-100'}`}>
          <h2 className="text-lg font-bold">Feedback</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 w-full bg-white">
            <iframe 
                src="https://docs.google.com/forms/d/e/1FAIpQLScMZLG3xZVGMHgKMq_QXSzQG35tDYwrtoeXLgtHyKbqD4bR5Q/viewform?embedded=true" 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                marginHeight={0} 
                marginWidth={0}
                title="Feedback Form"
            >
                Loading…
            </iframe>
        </div>
      </div>
    </div>
  );
};
