import React from 'react';
import { 
  Users, 
  FileText, 
  Thermometer, 
  LogOut, 
  Wrench,
  LayoutDashboard,
  Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ViewType, CompanySettings } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ activeView, setActiveView, isOpen, onClose }: SidebarProps) {
  const [companySettings, setCompanySettings] = React.useState<Partial<CompanySettings>>({
    company_name: 'i9Manutenção',
    logo_url: null
  });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes & CRM', icon: Users },
    { id: 'reports', label: 'Laudos & Vistoria', icon: FileText },
    { id: 'calculator', label: 'Orçamento de Câmara', icon: Thermometer },
    { id: 'settings', label: 'Configurações', icon: SettingsIcon },
  ];

  const fetchSettings = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('settings')
        .select('company_name, logo_url')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setCompanySettings(data);
      }
    } catch (err) {
      console.error("Erro ao carregar sidebar settings:", err);
    }
  };

  React.useEffect(() => {
    fetchSettings();
    window.addEventListener('settingsUpdated', fetchSettings);
    return () => window.removeEventListener('settingsUpdated', fetchSettings);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleNavClick = (view: ViewType) => {
    setActiveView(view);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-brand-surface border-r border-brand-border flex flex-col h-screen transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-brand-border">
          <div className="flex items-center gap-3">
            {companySettings.logo_url ? (
              <img 
                src={companySettings.logo_url} 
                alt="Logo" 
                className="w-10 h-10 object-contain bg-white/5 rounded-lg p-1"
              />
            ) : (
              <div className="w-10 h-10 bg-brand-blue rounded-lg flex items-center justify-center neon-glow">
                <Wrench className="text-brand-dark w-6 h-6" />
              </div>
            )}
            <span className="font-bold text-lg text-white tracking-tight truncate max-w-[140px]">
              {companySettings.company_name}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <LogOut size={20} className="rotate-180" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as ViewType)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                activeView === item.id 
                  ? "bg-brand-blue text-brand-dark font-semibold shadow-lg shadow-brand-blue/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn(
                activeView === item.id ? "text-brand-dark" : "text-slate-500 group-hover:text-brand-blue"
              )} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-border">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={20} />
            Sair do Sistema
          </button>
        </div>
      </aside>
    </>
  );
}
