import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, CheckCircle, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';

export const InstallPwaModal = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInsecureOrigin, setIsInsecureOrigin] = useState(false);

  useEffect(() => {
    // Check if running in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsStandalone(true);
    }

    // Check secure context requirement (Chrome blocks PWA installation on remote HTTP origins)
    const isSecure = window.isSecureContext || 
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1';
    
    setIsInsecureOrigin(!isSecure);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture Android/Chrome install prompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      console.log('[LifeOS PWA] Captured beforeinstallprompt event.');
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("To install, tap your browser menu (⋮ in top-right) and select 'Install app' or 'Add to Home screen'.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[LifeOS PWA] Install choice outcome:', outcome);
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-dark-850 border border-dark-700/80 rounded-t-3xl sm:rounded-2xl shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-700 flex items-center justify-center shadow-glow-brand p-2">
              <img src="/pwa-192x192.png" alt="LifeOS Icon" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Install LifeOS App</h3>
              <p className="text-xs text-slate-400">Add to your home screen for full-screen mode</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-750 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Benefits */}
        <div className="space-y-2 py-1 text-xs text-slate-300">
          <div className="flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Full-screen experience without browser URL bars</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Works 100% offline with automatic sync</span>
          </div>
          <div className="flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Push & Telegram schedule alerts</span>
          </div>
        </div>

        {/* Insecure Context Warning for Android Chrome */}
        {isInsecureOrigin && !isStandalone && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
            <div className="flex items-center space-x-2 font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Android Chrome Security Requirement</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Android Chrome strictly disables PWA installation over local HTTP network IPs (<code className="text-amber-400 bg-dark-900 px-1 py-0.5 rounded">{window.location.host}</code>). 
              Installation is permitted on <strong>HTTPS</strong> (e.g. Vercel) or <strong>localhost</strong>.
            </p>
          </div>
        )}

        {/* Action based on platform */}
        {isStandalone ? (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-semibold">
            ✓ LifeOS is already installed and running in app mode!
          </div>
        ) : isIOS ? (
          <div className="p-4 rounded-xl bg-dark-800 border border-dark-700 space-y-2 text-xs text-slate-300">
            <p className="font-bold text-white flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-brand-400" />
              <span>How to install on iPhone & iPad:</span>
            </p>
            <ol className="list-decimal list-inside space-y-1.5 pl-1 text-slate-300">
              <li>Tap the <strong className="text-white">Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-1 text-brand-400" /> at bottom of Safari.</li>
              <li>Scroll down and select <strong className="text-white">"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-slate-200" />.</li>
              <li>Tap <strong className="text-white">"Add"</strong> in the top right corner.</li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-brand-500 hover:bg-brand-600 text-white shadow-glow-brand flex items-center justify-center space-x-2 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{deferredPrompt ? 'Install on Android Home Screen' : 'Install LifeOS PWA'}</span>
            </button>
            <p className="text-[11px] text-center text-slate-400">
              You can also open Chrome's menu (<strong>⋮</strong>) and tap <strong>"Install app"</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
