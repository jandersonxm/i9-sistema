import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Reports from './components/Reports';
import Calculator from './components/Calculator';
import Settings from './components/Settings';
import { ViewType } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Settings as SettingsIcon, Menu, X, Wrench as WrenchIcon } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setConfigError(true);
      return;
    }

    // Check initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch(err => {
        console.error("Erro ao buscar sessão:", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin neon-glow"></div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full glass p-8 rounded-2xl text-center">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <SettingsIcon className="text-amber-500 w-8 h-8 animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Configuração Necessária</h1>
          <p className="text-slate-400 mb-8">
            Para utilizar o sistema i9Manutenção, você precisa configurar as chaves do Supabase no arquivo <code className="bg-brand-dark px-2 py-1 rounded text-brand-blue">.env</code>.
          </p>
          <div className="space-y-4 text-left bg-brand-dark/50 p-4 rounded-xl border border-brand-border">
            <div className="flex gap-3">
              <AlertCircle size={18} className="text-brand-blue shrink-0 mt-1" />
              <p className="text-sm text-slate-300">Defina <code className="text-brand-blue">VITE_SUPABASE_URL</code></p>
            </div>
            <div className="flex gap-3">
              <AlertCircle size={18} className="text-brand-blue shrink-0 mt-1" />
              <p className="text-sm text-slate-300">Defina <code className="text-brand-blue">VITE_SUPABASE_ANON_KEY</code></p>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-brand-blue text-brand-dark font-bold py-3 rounded-xl mt-8 hover:bg-brand-blue/90 transition-all"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'clients': return <Clients />;
      case 'reports': return <Reports />;
      case 'calculator': return <Calculator />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-dark text-slate-200 overflow-hidden relative">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-brand-surface border-b border-brand-border p-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-blue rounded flex items-center justify-center neon-glow">
              <WrenchIcon className="text-brand-dark w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">i9Manutenção</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Global CSS for scrollbars */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}} />
    </div>
  );
}
