import { Cloud, CloudOff, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CloudSyncIndicatorProps {
  isSyncing: boolean;
  lastSyncTime?: number;
}

export function CloudSyncIndicator({ isSyncing, lastSyncTime }: CloudSyncIndicatorProps) {
  const [showSynced, setShowSynced] = useState(false);

  useEffect(() => {
    if (!isSyncing && lastSyncTime) {
      setShowSynced(true);
      const timer = setTimeout(() => setShowSynced(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSyncing, lastSyncTime]);

  if (showSynced) {
    return (
      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 animate-in fade-in zoom-in duration-300">
        <div className="relative">
          <Cloud className="w-4 h-4" />
          <Check className="w-2.5 h-2.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <span className="text-xs">Synced</span>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 animate-pulse">
        <Cloud className="w-4 h-4" />
        <span className="text-xs">Syncing...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
      <Cloud className="w-4 h-4" />
      <span className="text-xs">Cloud</span>
    </div>
  );
}
