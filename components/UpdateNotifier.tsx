import React, { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

const APP_VERSION = '1.0.0';

interface UpdateNotifierProps {
  theme: string;
  accentColor: string;
}

export const UpdateNotifier: React.FC<UpdateNotifierProps> = ({ theme, accentColor }) => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Check if dismissed in this session
    if (sessionStorage.getItem('update_dismissed') === 'true') {
      setDismissed(true);
      return;
    }

    // 2. Service Worker PWA Approach
    if ('serviceWorker' in navigator) {
       navigator.serviceWorker.ready.then(registration => {
         registration.addEventListener('updatefound', () => {
           // A new service worker is being installed
           setUpdateAvailable(true);
         });
       });
    }

    // 3. Fallback/Alternative Approach (Remote JSON check)
    const checkVersion = async () => {
      try {
        // Fetching from a public file. You can replace this with a GitHub RAW URL or Firestore call.
        const res = await fetch('/version.json?t=' + new Date().getTime());
        if (res.ok) {
          const data = await res.json();
          // If remote version differs from hardcoded version, trigger update notification
          if (data.version && data.version !== APP_VERSION) {
             setUpdateAvailable(true);
          }
        }
      } catch (e) {
        // Silently fail if file doesn't exist or network error
      }
    };

    checkVersion();
    
    // Check every hour
    const interval = setInterval(checkVersion, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    // If there's a waiting SW, try to skip waiting
    if ('serviceWorker' in navigator) {
       navigator.serviceWorker.getRegistrations().then(regs => {
          regs.forEach(reg => {
             if (reg.waiting) {
                 reg.waiting.postMessage({ type: 'SKIP_WAITING' });
             }
          });
       });
    }
    
    // Hard reload the browser fully
    window.location.reload();
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('update_dismissed', 'true');
  };

  // Do not render anything if no update or already dismissed
  if (!updateAvailable || dismissed) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-sm animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div 
         className={`p-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border flex flex-col gap-4 ${
             theme === 'neon' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-pink-100 text-slate-800'
         }`}
      >
        <button 
           onClick={handleDismiss}
           className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
           <X size={18} />
        </button>
        
        <div className="flex items-center gap-3">
           <div className="p-2.5 rounded-2xl" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
               <Sparkles size={24} strokeWidth={1.5} />
           </div>
           <p className="font-bold text-[15px] leading-tight pr-6">
              ✨ O nouă versiune este disponibilă! S-au adăugat lucruri drăguțe.
           </p>
        </div>

        <div className="flex gap-3 mt-1">
           <button 
              onClick={handleDismiss}
              className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 ${
                  theme === 'neon' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'
              }`}
           >
              Mai târziu
           </button>
           <button 
              onClick={handleUpdate}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, boxShadow: `0 4px 14px 0 ${accentColor}40` }}
           >
              Actualizează acum
           </button>
        </div>
      </div>
    </div>
  );
};
