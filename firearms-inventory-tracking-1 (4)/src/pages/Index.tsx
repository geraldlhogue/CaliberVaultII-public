import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { SafeAppProvider } from '@/contexts/AppContextSafe';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginPage } from '@/components/auth/LoginPage';


const AuthenticatedApp = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <LoginPage />;
  }
  
  return (
    <SafeAppProvider>
      <AppLayout />
    </SafeAppProvider>
  );

};

const Index = () => {
  return <AuthenticatedApp />;
};

export default Index;
