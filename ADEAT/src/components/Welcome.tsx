import { Sparkles, Lock, Cloud, Zap, Palette, Shield, Smartphone } from 'lucide-react';
import { Button } from './ui/button';

interface WelcomeProps {
  onGetStarted: () => void;
}

export function Welcome({ onGetStarted }: WelcomeProps) {
  const features = [
    {
      icon: Cloud,
      title: 'Cloud Sync',
      description: 'Your notes, everywhere',
      gradient: 'from-purple-400 to-pink-400',
    },
    {
      icon: Palette,
      title: 'Rich Editor',
      description: 'Beautiful formatting tools',
      gradient: 'from-pink-400 to-rose-400',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data stays safe',
      gradient: 'from-violet-400 to-purple-400',
    },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-pink-500 via-purple-500 to-violet-600 text-white relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-pink-400/30 to-transparent rounded-full -top-32 -right-32 blur-3xl animate-pulse" />
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-purple-400/30 to-transparent rounded-full top-1/2 -left-32 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute w-[450px] h-[450px] bg-gradient-to-br from-violet-400/30 to-transparent rounded-full -bottom-32 right-0 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-between px-8 py-12">
        {/* Header Section */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          {/* App Icon */}
          <div className="relative mb-8">
            <div className="w-28 h-28 bg-white/20 backdrop-blur-2xl rounded-[32px] flex items-center justify-center shadow-2xl border border-white/30 transform hover:scale-105 transition-transform">
              <div className="w-20 h-20 bg-gradient-to-br from-white to-white/80 rounded-3xl flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-purple-600" />
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-white mb-3 text-5xl font-bold tracking-tight">
            CloudNotes
          </h1>
          
          <p className="text-white/90 mb-12 max-w-xs text-lg">
            Your creative space for ideas, thoughts, and inspiration
          </p>

          {/* Features Grid */}
          <div className="w-full max-w-sm space-y-3 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-white mb-0.5 font-semibold">{feature.title}</h3>
                    <p className="text-white/75 text-sm">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="w-full max-w-sm space-y-4">
          <Button
            onClick={onGetStarted}
            className="w-full bg-white text-purple-600 hover:bg-white/95 h-14 shadow-2xl font-semibold text-lg rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Get Started
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
            <Shield className="w-4 h-4" />
            <span>Secure • Private • Fast</span>
          </div>
        </div>
      </div>
    </div>
  );
}