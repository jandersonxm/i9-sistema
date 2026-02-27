import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CompanySettings } from '../types';
import { Settings as SettingsIcon, Building2, Phone, Upload, Save, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const [settings, setSettings] = useState<Partial<CompanySettings>>({
    company_name: '',
    phone: '',
    logo_url: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error("Erro ao buscar configurações:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const payload = {
        ...settings,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('settings')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      // Trigger a custom event to notify other components (like Sidebar)
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logo_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center border border-brand-blue/20">
          <SettingsIcon className="text-brand-blue" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-white">Configurações</h2>
          <p className="text-slate-400">Personalize os dados da sua empresa para os laudos</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="glass rounded-2xl p-6 md:p-8 space-y-8">
          {/* Company Info */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-brand-blue">
              <Building2 size={18} />
              <h3 className="font-semibold uppercase tracking-wider text-xs">Dados da Empresa</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Nome da Empresa</label>
                <input
                  type="text"
                  required
                  value={settings.company_name}
                  onChange={e => setSettings({ ...settings, company_name: e.target.value })}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white neon-border"
                  placeholder="Ex: i9 Refrigeração LTDA"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">WhatsApp / Telefone</label>
                <input
                  type="tel"
                  required
                  value={settings.phone}
                  onChange={e => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-white neon-border"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </section>

          {/* Logo Upload */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-brand-blue">
              <Upload size={18} />
              <h3 className="font-semibold uppercase tracking-wider text-xs">Logotipo</h3>
            </div>
            
            <div className="flex flex-col items-center gap-6 p-6 border-2 border-dashed border-brand-border rounded-2xl hover:border-brand-blue/50 transition-all">
              {settings.logo_url ? (
                <div className="relative group">
                  <img 
                    src={settings.logo_url} 
                    alt="Logo preview" 
                    className="h-32 w-auto object-contain rounded-lg bg-white/5 p-2"
                  />
                  <button 
                    type="button"
                    onClick={() => setSettings({ ...settings, logo_url: null })}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <SettingsIcon size={14} className="rotate-45" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 bg-brand-dark rounded-full flex items-center justify-center text-slate-600">
                  <Building2 size={40} />
                </div>
              )}
              
              <div className="text-center">
                <label className="cursor-pointer bg-brand-blue text-brand-dark font-bold px-6 py-2 rounded-xl hover:bg-brand-blue/90 transition-all inline-block">
                  Selecionar Logo
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </label>
                <p className="text-slate-500 text-xs mt-2">Recomendado: PNG transparente, máx 2MB</p>
              </div>
            </div>
          </section>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <SettingsIcon size={18} />}
            <span className="text-sm font-medium">{message.text}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand-blue text-brand-dark font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-lg shadow-brand-blue/20"
        >
          <Save size={20} />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
}
