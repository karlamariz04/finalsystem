import { ChevronRight, Download, Trash2, Info, Bell, Lock, Type, LogOut, Moon, Sun } from 'lucide-react';
import { Switch } from './ui/switch';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface SettingsProps {
  onClearAllNotes: () => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function Settings({ onClearAllNotes, onLogout, theme, onThemeChange }: SettingsProps) {
  const [notifications, setNotifications] = useState(
    localStorage.getItem('notifications') === 'true'
  );
  const [autoSave, setAutoSave] = useState(
    localStorage.getItem('autoSave') !== 'false'
  );

  const handleNotificationsToggle = (value: boolean) => {
    setNotifications(value);
    localStorage.setItem('notifications', String(value));
  };

  const handleAutoSaveToggle = (value: boolean) => {
    setAutoSave(value);
    localStorage.setItem('autoSave', String(value));
  };

  const handleThemeToggle = (value: boolean) => {
    onThemeChange(value ? 'dark' : 'light');
  };

  const handleExportNotes = () => {
    const notes = localStorage.getItem('cloudNotes');
    if (notes) {
      const blob = new Blob([notes], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notes-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          description: 'Get reminders and updates',
          type: 'toggle' as const,
          value: notifications,
          onChange: handleNotificationsToggle,
        },
        {
          icon: Type,
          label: 'Auto Save',
          description: 'Automatically save your notes',
          type: 'toggle' as const,
          value: autoSave,
          onChange: handleAutoSaveToggle,
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: theme === 'dark' ? Moon : Sun,
          label: 'Dark Mode',
          description: theme === 'dark' ? 'Dark theme enabled' : 'Light theme enabled',
          type: 'toggle' as const,
          value: theme === 'dark',
          onChange: handleThemeToggle,
        },
      ],
    },
    {
      title: 'Data & Storage',
      items: [
        {
          icon: Download,
          label: 'Export Notes',
          description: 'Download backup as JSON',
          type: 'action' as const,
          action: handleExportNotes,
        },
        {
          icon: Trash2,
          label: 'Clear All Notes',
          description: 'Delete all notes permanently',
          type: 'alert' as const,
          danger: true,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: LogOut,
          label: 'Sign Out',
          description: 'Logout from your account',
          type: 'action' as const,
          action: onLogout,
          danger: true,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: Info,
          label: 'App Version',
          description: '2.0.0',
          type: 'info' as const,
        },
        {
          icon: Lock,
          label: 'Privacy Policy',
          description: 'Learn how we protect your data',
          type: 'navigate' as const,
        },
      ],
    },
  ];

  return (
    <div className="h-full overflow-auto bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 smooth-scroll">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-6 pt-12 pb-8 text-white">
        <h1 className="text-white">Settings</h1>
        <p className="text-white/80 mt-1">Manage your preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="px-6 py-6 space-y-6">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-slate-900 dark:text-white mb-3 px-1">{section.title}</h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              {section.items.map((item, index) => {
                const Icon = item.icon;
                const isLast = index === section.items.length - 1;

                if (item.type === 'toggle') {
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-4 p-4 ${!isLast ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-slate-500 dark:text-slate-400">{item.description}</p>
                      </div>
                      <Switch
                        checked={item.value}
                        onCheckedChange={item.onChange}
                      />
                    </div>
                  );
                }

                if (item.type === 'alert' && item.danger) {
                  return (
                    <AlertDialog key={item.label}>
                      <AlertDialogTrigger asChild>
                        <button
                          className={`w-full flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ${!isLast ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-red-600 dark:text-red-400">{item.label}</p>
                            <p className="text-slate-500 dark:text-slate-400">{item.description}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="dark:text-white">Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription className="dark:text-slate-400">
                            This action cannot be undone. This will permanently delete all your notes and remove your data from local storage.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={onClearAllNotes}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete All Notes
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  );
                }

                if (item.type === 'action') {
                  const isDanger = item.danger;
                  return (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className={`w-full flex items-center gap-4 p-4 transition-colors ${
                        isDanger 
                          ? 'hover:bg-red-50 dark:hover:bg-red-950/30' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      } ${!isLast ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                        isDanger 
                          ? 'from-red-500 to-pink-500' 
                          : 'from-indigo-500 to-purple-500'
                      } flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={isDanger ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}>
                          {item.label}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400">{item.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                  );
                }

                return (
                  <button
                    key={item.label}
                    className={`w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${!isLast ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-slate-500 dark:text-slate-400">{item.description}</p>
                    </div>
                    {item.type === 'navigate' && (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
