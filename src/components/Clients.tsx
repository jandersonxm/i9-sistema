import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { cn } from '../lib/utils';
import { Client, Service } from '../types';
import { 
  Plus, 
  Search, 
  Users,
  Phone, 
  MapPin, 
  History, 
  Trash2, 
  Edit2,
  ChevronRight,
  Calendar,
  DollarSign,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, formatPhone } from '../lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', address: '', phone: '' });
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchServices(selectedClient.id);
      setIsMobileDetailView(true);
    } else {
      setIsMobileDetailView(false);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (!error && data) setClients(data);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async (clientId: string) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });
      
      if (!error && data) setServices(data);
    } catch (err) {
      console.error("Erro ao buscar serviços:", err);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('clients')
      .insert([newClient])
      .select();

    if (!error && data) {
      setClients([...clients, data[0]]);
      setShowModal(false);
      setNewClient({ name: '', address: '', phone: '' });
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (!error) {
        setClients(clients.filter(c => c.id !== id));
        if (selectedClient?.id === id) setSelectedClient(null);
      }
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6 relative">
      {/* Client List */}
      <div className={cn(
        "w-full lg:w-1/3 flex flex-col gap-4 transition-all duration-300",
        isMobileDetailView ? "hidden lg:flex" : "flex"
      )}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-white">Clientes</h2>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-brand-blue text-brand-dark p-2 rounded-lg hover:scale-105 transition-transform"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-brand-surface border border-brand-border rounded-xl pl-10 pr-4 py-2.5 text-sm neon-border"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar min-h-[400px]">
          {loading ? (
            <div className="text-center py-10 text-slate-500">Carregando...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-10 text-slate-500 italic">Nenhum cliente encontrado.</div>
          ) : (
            filteredClients.map(client => (
              <motion.div
                layout
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  selectedClient?.id === client.id 
                    ? 'bg-brand-blue/10 border-brand-blue' 
                    : 'bg-brand-surface border-brand-border hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{client.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-400 mt-1">
                      <Phone size={12} />
                      {formatPhone(client.phone)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(client.id);
                      }}
                      className="text-slate-600 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={18} className="text-slate-600 lg:hidden" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Client Details & History */}
      <div className={cn(
        "flex-1 glass rounded-2xl p-4 md:p-6 flex flex-col transition-all duration-300",
        !isMobileDetailView ? "hidden lg:flex" : "flex fixed inset-0 z-40 lg:relative lg:inset-auto bg-brand-dark lg:bg-transparent"
      )}>
        <AnimatePresence mode="wait">
          {selectedClient ? (
            <motion.div
              key={selectedClient.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col"
            >
              <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-8 gap-4">
                <div className="flex items-start gap-3 w-full">
                  <button 
                    onClick={() => setSelectedClient(null)}
                    className="lg:hidden p-2 bg-brand-surface border border-brand-border rounded-lg text-slate-400"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl md:text-3xl font-bold text-white truncate">{selectedClient.name}</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-slate-400">
                      <span className="flex items-center gap-1 text-xs md:text-sm truncate">
                        <MapPin size={14} className="text-brand-blue shrink-0" />
                        {selectedClient.address}
                      </span>
                      <span className="flex items-center gap-1 text-xs md:text-sm">
                        <Phone size={14} className="text-brand-blue shrink-0" />
                        {formatPhone(selectedClient.phone)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <button className="flex-1 md:flex-none bg-slate-800 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-slate-700">
                    <Edit2 size={16} /> Editar
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center gap-2 mb-4">
                  <History size={18} className="text-brand-blue" />
                  <h3 className="font-semibold text-base md:text-lg text-white">Histórico de Serviços</h3>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {services.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 py-10">
                      <AlertCircle size={40} />
                      <p className="text-sm text-center">Nenhum serviço registrado para este cliente.</p>
                    </div>
                  ) : (
                    services.map((service, index) => (
                      <div key={service.id} className="relative pl-6 md:pl-8 pb-8 last:pb-0">
                        {/* Timeline Line */}
                        {index !== services.length - 1 && (
                          <div className="absolute left-2.5 md:left-3 top-6 bottom-0 w-px bg-brand-border" />
                        )}
                        {/* Timeline Dot */}
                        <div className="absolute left-0 top-1.5 w-5 h-5 md:w-6 md:h-6 rounded-full bg-brand-surface border-2 border-brand-blue flex items-center justify-center">
                          <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-brand-blue" />
                        </div>

                        <div className="bg-brand-dark/30 border border-brand-border rounded-xl p-4 hover:border-brand-blue/30 transition-all">
                          <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
                            <div>
                              <span className="text-[10px] font-mono text-brand-blue uppercase tracking-wider">
                                {service.type}
                              </span>
                              <h4 className="text-white font-medium mt-0.5 text-sm md:text-base">{service.equipment}</h4>
                            </div>
                            <div className="text-left sm:text-right w-full sm:w-auto">
                              <div className="text-[10px] md:text-xs text-slate-500 flex items-center gap-1 sm:justify-end">
                                <Calendar size={12} />
                                {format(new Date(service.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                              </div>
                              <div className="text-brand-blue font-bold mt-0.5 text-sm md:text-base">
                                {formatCurrency(service.value)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm">
                            <div className="bg-brand-surface/50 p-3 rounded-lg">
                              <span className="text-[10px] text-slate-500 block mb-1">Defeito</span>
                              <p className="text-slate-300">{service.defect}</p>
                            </div>
                            <div className="bg-brand-surface/50 p-3 rounded-lg">
                              <span className="text-[10px] text-slate-500 block mb-1">Solução</span>
                              <p className="text-slate-300">{service.solution}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center">
                <Users size={32} className="md:w-10 md:h-10" />
              </div>
              <p className="text-base md:text-lg text-center">Selecione um cliente para ver os detalhes</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-brand-surface border border-brand-border w-full max-w-md rounded-2xl p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Novo Cliente</h2>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo / Empresa</label>
                <input
                  type="text"
                  required
                  value={newClient.name}
                  onChange={e => setNewClient({...newClient, name: e.target.value})}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2 text-white neon-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Endereço</label>
                <input
                  type="text"
                  required
                  value={newClient.address}
                  onChange={e => setNewClient({...newClient, address: e.target.value})}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2 text-white neon-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">WhatsApp / Telefone</label>
                <input
                  type="tel"
                  required
                  value={newClient.phone}
                  onChange={e => setNewClient({...newClient, phone: e.target.value})}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2 text-white neon-border"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-brand-border text-slate-400 hover:bg-slate-800 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-xl bg-brand-blue text-brand-dark font-bold hover:bg-brand-blue/90 transition-all"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
