import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Client, CompanySettings } from '../types';
import { 
  FileText, 
  Download, 
  Camera, 
  Plus, 
  CheckCircle2,
  User,
  Package,
  Activity,
  Lightbulb
} from 'lucide-react';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Reports() {
  const [clients, setClients] = useState<Client[]>([]);
  const [companySettings, setCompanySettings] = useState<Partial<CompanySettings>>({
    company_name: 'i9Manutenção',
    phone: '',
    logo_url: null
  });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    equipment: '',
    model: '',
    defect: '',
    solution: '',
    value: '',
    type: 'Manutenção Corretiva'
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data } = await supabase.from('clients').select('*').order('name');
      if (data) setClients(data);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: settingsData } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        if (settingsData) setCompanySettings(settingsData);
      }
    } catch (err) {
      console.error("Erro ao buscar dados para laudos:", err);
    }
  };

  const handleGeneratePDF = () => {
    const client = clients.find(c => c.id === formData.clientId);
    if (!client) return alert('Selecione um cliente');

    const doc = new jsPDF();
    const date = format(new Date(), "dd/MM/yyyy HH:mm");

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    
    if (companySettings.logo_url) {
      try {
        doc.addImage(companySettings.logo_url, 'PNG', 10, 5, 30, 30);
      } catch (e) {
        console.error("Erro ao adicionar logo ao PDF:", e);
      }
    }

    doc.setTextColor(0, 210, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(companySettings.company_name || 'i9Manutenção', companySettings.logo_url ? 45 : 20, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`WhatsApp: ${companySettings.phone || '(00) 00000-0000'}`, companySettings.logo_url ? 45 : 20, 32);
    doc.text('LAUDO TÉCNICO DE REFRIGERAÇÃO', 140, 25);

    // Client Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('DADOS DO CLIENTE', 20, 55);
    doc.line(20, 57, 190, 57);
    
    autoTable(doc, {
      startY: 60,
      body: [
        ['Cliente:', client.name],
        ['Endereço:', client.address],
        ['Telefone:', client.phone],
        ['Data/Hora:', date],
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    });

    // Service Info
    doc.text('DETALHES DA VISTORIA', 20, (doc as any).lastAutoTable.finalY + 15);
    doc.line(20, (doc as any).lastAutoTable.finalY + 17, 190, (doc as any).lastAutoTable.finalY + 17);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      body: [
        ['Equipamento:', formData.equipment],
        ['Modelo:', formData.model],
        ['Tipo de Serviço:', formData.type],
        ['Defeito Encontrado:', formData.defect],
        ['Solução Aplicada:', formData.solution],
        ['Valor do Serviço:', `R$ ${formData.value}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(10);
    doc.text('__________________________', 20, finalY + 40);
    doc.text('Assinatura do Técnico', 20, finalY + 45);
    
    doc.text('__________________________', 130, finalY + 40);
    doc.text('Assinatura do Cliente', 130, finalY + 45);

    doc.save(`Laudo_${client.name.replace(/\s/g, '_')}_${format(new Date(), 'ddMMyy')}.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.from('services').insert([{
      client_id: formData.clientId,
      equipment: formData.equipment,
      model: formData.model,
      defect: formData.defect,
      solution: formData.solution,
      value: parseFloat(formData.value),
      type: formData.type,
      date: new Date().toISOString()
    }]);

    if (!error) {
      alert('Laudo salvo com sucesso!');
      handleGeneratePDF();
      setFormData({
        clientId: '',
        equipment: '',
        model: '',
        defect: '',
        solution: '',
        value: '',
        type: 'Manutenção Corretiva'
      });
    } else {
      alert('Erro ao salvar laudo: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-1 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Novo Laudo Técnico</h2>
          <p className="text-slate-400 text-sm md:text-base">Preencha os dados da vistoria para gerar o PDF</p>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center border border-brand-blue/20">
          <FileText className="text-brand-blue w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-2xl p-5 md:p-8 space-y-6 md:space-y-8">
          {/* Client Selection */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-brand-blue">
              <User size={16} className="md:w-4.5 md:h-4.5" />
              <h3 className="font-semibold uppercase tracking-wider text-[10px] md:text-xs">Informações do Cliente</h3>
            </div>
            <select
              required
              value={formData.clientId}
              onChange={e => setFormData({...formData, clientId: e.target.value})}
              className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm md:text-base text-white neon-border"
            >
              <option value="">Selecione o Cliente</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </section>

          {/* Equipment Info */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2 md:mb-4 text-brand-blue">
                <Package size={16} className="md:w-4.5 md:h-4.5" />
                <h3 className="font-semibold uppercase tracking-wider text-[10px] md:text-xs">Dados do Equipamento</h3>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 md:mb-2">Equipamento</label>
              <input
                type="text"
                required
                placeholder="Ex: Ar Condicionado, Câmara Fria"
                value={formData.equipment}
                onChange={e => setFormData({...formData, equipment: e.target.value})}
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm md:text-base text-white neon-border"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 md:mb-2">Modelo / Marca</label>
              <input
                type="text"
                required
                placeholder="Ex: Samsung Digital Inverter"
                value={formData.model}
                onChange={e => setFormData({...formData, model: e.target.value})}
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm md:text-base text-white neon-border"
              />
            </div>
          </section>

          {/* Technical Details */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-brand-blue">
              <Activity size={16} className="md:w-4.5 md:h-4.5" />
              <h3 className="font-semibold uppercase tracking-wider text-[10px] md:text-xs">Vistoria Técnica</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="col-span-1">
                <label className="block text-xs text-slate-500 mb-1.5 md:mb-2">Tipo de Serviço</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm md:text-base text-white neon-border"
                >
                  <option>Manutenção Corretiva</option>
                  <option>Manutenção Preventiva</option>
                  <option>Instalação</option>
                  <option>Carga de Gás</option>
                  <option>Limpeza</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-xs text-slate-500 mb-1.5 md:mb-2">Valor do Serviço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={formData.value}
                  onChange={e => setFormData({...formData, value: e.target.value})}
                  className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm md:text-base text-white neon-border font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 md:mb-2">Defeito Encontrado</label>
              <textarea
                required
                rows={3}
                placeholder="Descreva o problema identificado..."
                value={formData.defect}
                onChange={e => setFormData({...formData, defect: e.target.value})}
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm md:text-base text-white neon-border resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5 md:mb-2">Solução Aplicada</label>
              <textarea
                required
                rows={3}
                placeholder="Descreva o que foi feito para resolver..."
                value={formData.solution}
                onChange={e => setFormData({...formData, solution: e.target.value})}
                className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-3 text-sm md:text-base text-white neon-border resize-none"
              />
            </div>
          </section>

          {/* Photos */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-brand-blue">
              <Camera size={16} className="md:w-4.5 md:h-4.5" />
              <h3 className="font-semibold uppercase tracking-wider text-[10px] md:text-xs">Evidências Fotográficas</h3>
            </div>
            <div className="border-2 border-dashed border-brand-border rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center hover:border-brand-blue/50 transition-all cursor-pointer group">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-surface rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="text-slate-500 group-hover:text-brand-blue" />
              </div>
              <p className="text-slate-500 text-xs md:text-sm text-center">Clique para upload ou arraste as fotos</p>
              <p className="text-slate-600 text-[10px] md:text-xs mt-1">Máximo 4 fotos (JPG, PNG)</p>
            </div>
          </section>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-brand-blue text-brand-dark font-bold py-3.5 md:py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 text-sm md:text-base order-1 sm:order-none"
          >
            <CheckCircle2 size={18} className="md:w-5 md:h-5" />
            {loading ? 'Salvando...' : 'Finalizar e Gerar PDF'}
          </button>
          <button
            type="button"
            onClick={handleGeneratePDF}
            className="px-6 md:px-8 bg-slate-800 text-white font-bold py-3.5 md:py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-all text-sm md:text-base"
          >
            <Download size={18} className="md:w-5 md:h-5" />
            Apenas PDF
          </button>
        </div>
      </form>
    </div>
  );
}
