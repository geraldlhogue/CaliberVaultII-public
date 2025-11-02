import React, { useState } from 'react';
import { Menu, X, Home, Settings, BarChart3, FileText, Database, Users, Shield, Wrench, Package, Search, Activity, TrendingUp, Smartphone, UsersRound, Code, Bell, Zap, GraduationCap, AlertTriangle } from 'lucide-react';










import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';

interface MainNavigationProps {
  onNavigate: (screen: string) => void;
  currentScreen: string;
}

export function MainNavigation({ onNavigate, currentScreen }: MainNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'search', label: 'Advanced Search', icon: Search },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Advanced Reports', icon: TrendingUp },
    { id: 'teams', label: 'Team Workspace', icon: UsersRound },
    { id: 'onboarding-analytics', label: 'Onboarding Analytics', icon: GraduationCap },
    { id: 'developer', label: 'Developer API', icon: Code },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations & AI', icon: Zap },
    { id: 'admin', label: 'Admin', icon: Settings },
    { id: 'error-monitoring', label: 'Error Monitoring', icon: AlertTriangle },

    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'mobile', label: 'Mobile & PWA', icon: Smartphone },
    { id: 'database', label: 'Database Tools', icon: Database },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'profile', label: 'Profile', icon: Users },
  ];

  const handleNavigate = (screen: string) => {
    onNavigate(screen);
    setIsOpen(false);
  };

  return (

    <>
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 md:hidden bg-yellow-600 hover:bg-yellow-700"
        size="icon"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-64 bg-slate-800 border-r border-slate-700 p-4 overflow-y-auto z-40">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-yellow-500">CaliberVault</h1>
          <p className="text-sm text-slate-400">{user?.email}</p>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentScreen === item.id
                    ? 'bg-yellow-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)}>
          <div 
            className="fixed right-0 top-0 h-full w-64 bg-slate-800 p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8 mt-16">
              <h1 className="text-xl font-bold text-yellow-500">CaliberVault</h1>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
            
            <nav className="space-y-2">
              {menuItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      currentScreen === item.id
                        ? 'bg-yellow-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default MainNavigation;
