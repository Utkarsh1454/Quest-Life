import React, { useState } from 'react';
import { X, Smartphone, Watch, Activity, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function WearablesModal({ onClose }) {
  const [syncing, setSyncing] = useState(false);
  const [synced, setSynced] = useState(false);
  const [steps, setSteps] = useState(4520);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSteps(prev => prev + 1280); // mock steps update
      setSyncing(false);
      setSynced(true);
      setTimeout(() => setSynced(false), 3000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative glass-card">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/5 bg-white/5">
          <h2 className="text-xl font-heading font-semibold flex items-center gap-2">
            <Watch className="w-5 h-5 text-quest-primary" />
            Wearables Sync
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-[#FFFAF3] dark:bg-quest-darkest rounded-xl p-4 border border-[#FFE5BF]/60 dark:border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-quest-primary/10 rounded-full blur-3xl group-hover:bg-quest-primary/20 transition-colors"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Smartphone className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">Apple Health / G-Fit</div>
                  <div className="text-xs text-green-400 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Today's Steps</div>
                <div className="text-2xl font-bold font-heading text-gray-900 dark:text-white tracking-wide">
                  {steps.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400">Sync Data</h3>
            <p className="text-sm text-gray-500">
              Import your daily steps, active calories, and workout logs directly into your Quest Life progress.
            </p>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              synced 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : 'btn-primary'
            }`}
          >
            {syncing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Syncing Matrix...
              </>
            ) : synced ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Sync Complete! (+1280 XP)
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                Sync Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
