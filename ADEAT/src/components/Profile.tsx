import { Edit2, Calendar, FileText, PenTool, Award, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface ProfileProps {
  notesCount: number;
  totalWords: number;
}

export function Profile({ notesCount, totalWords }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [memberSince, setMemberSince] = useState<Date>(new Date());

  // Load user info from localStorage on mount
  useEffect(() => {
    const storedName = localStorage.getItem('userName') || 'User';
    const storedEmail = localStorage.getItem('userEmail') || 'user@email.com';
    const storedDate = localStorage.getItem('memberSince');
    
    setName(storedName);
    setEmail(storedEmail);
    
    if (storedDate) {
      setMemberSince(new Date(storedDate));
    } else {
      const now = new Date();
      localStorage.setItem('memberSince', now.toISOString());
      setMemberSince(now);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    setIsEditing(false);
  };

  const stats = [
    { label: 'Total Notes', value: notesCount, icon: FileText, color: 'from-pink-500 to-rose-500' },
    { label: 'Words Written', value: totalWords, icon: PenTool, color: 'from-purple-500 to-pink-500' },
    { label: 'Member Since', value: memberSince.getFullYear(), icon: Calendar, color: 'from-violet-500 to-purple-500' },
  ];

  const achievements = [
    { label: 'Notes Created', value: notesCount, icon: Award },
    { label: 'Active Days', value: Math.max(1, Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24))), icon: TrendingUp },
  ];

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-pink-50 via-purple-50 to-violet-50 dark:from-slate-950 dark:via-purple-950/20 dark:to-slate-900 smooth-scroll">
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-br from-pink-500 via-purple-500 to-violet-600 px-6 pt-12 pb-32 text-white overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-400/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative flex flex-col items-center">
          <Avatar className="w-28 h-28 border-4 border-white/50 shadow-2xl backdrop-blur">
            <AvatarImage src="" />
            <AvatarFallback className="text-white bg-gradient-to-br from-pink-400 to-purple-500 shadow-inner">
              {name.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          {isEditing ? (
            <div className="mt-6 w-full space-y-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-center bg-white/20 backdrop-blur-lg border-white/40 text-white placeholder:text-white/70 shadow-lg"
              />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-center bg-white/20 backdrop-blur-lg border-white/40 text-white placeholder:text-white/70 shadow-lg"
              />
              <Button
                onClick={handleSave}
                className="w-full bg-white text-purple-600 hover:bg-white/90 shadow-lg"
              >
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="mt-6 text-center">
              <h2 className="text-white mb-1 drop-shadow-lg">{name}</h2>
              <p className="text-white/90 mb-4 drop-shadow">{email}</p>
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="border-white/40 bg-white/15 backdrop-blur-lg text-white hover:bg-white/25 shadow-lg"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 -mt-20 pb-6 space-y-3 relative z-10">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-900/80 dark:backdrop-blur rounded-3xl shadow-xl p-6 flex items-center gap-5 border border-pink-100 dark:border-purple-900/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <Icon className="w-8 h-8 text-white drop-shadow" />
              </div>
              <div className="flex-1">
                <p className="text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                <p className="text-slate-900 dark:text-white bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{stat.value.toLocaleString()}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Achievements Section */}
      <div className="px-6 pb-6">
        <h3 className="text-slate-900 dark:text-white mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Achievements</h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.label}
                className="bg-gradient-to-br from-white to-pink-50/50 dark:from-slate-900/80 dark:to-purple-900/20 dark:backdrop-blur rounded-2xl shadow-lg p-4 border border-pink-100 dark:border-purple-900/50"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mb-3 shadow-md">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-slate-900 dark:text-white mb-1">{achievement.value}</p>
                  <p className="text-slate-500 dark:text-slate-400">{achievement.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Section */}
      <div className="px-6 pb-6">
        <h3 className="text-slate-900 dark:text-white mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Writing Progress</h3>
        <div className="bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-900/80 dark:to-purple-900/20 dark:backdrop-blur rounded-3xl shadow-lg p-6 border border-pink-100 dark:border-purple-900/50">
          <div className="text-center py-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
              <PenTool className="w-10 h-10 text-white drop-shadow" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-2">
              Keep writing amazing notes!
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              You've written {totalWords.toLocaleString()} words so far
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}