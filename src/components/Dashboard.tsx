import React from 'react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const stats = [
    { label: 'Total de Clientes', value: '124', icon: Users, color: 'text-blue-400', trend: '+12%', up: true },
    { label: 'Serviços este Mês', value: '48', icon: CheckCircle2, color: 'text-emerald-400', trend: '+5%', up: true },
    { label: 'Manutenções Pendentes', value: '12', icon: Clock, color: 'text-amber-400', trend: '-2%', up: false },
    { label: 'Faturamento Estimado', value: 'R$ 12.450', icon: TrendingUp, color: 'text-brand-blue', trend: '+18%', up: true },
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Bem-vindo, Técnico</h1>
        <p className="text-slate-400 mt-1 text-sm md:text-base">Aqui está o resumo da i9Manutenção hoje.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="glass p-5 md:p-6 rounded-2xl border border-brand-border hover:border-brand-blue/30 transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 md:p-3 rounded-xl bg-brand-dark/50 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} className="md:w-6 md:h-6" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] md:text-xs font-bold ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.up ? <ArrowUpRight size={12} className="md:w-3.5 md:h-3.5" /> : <ArrowDownRight size={12} className="md:w-3.5 md:h-3.5" />}
                {stat.trend}
              </div>
            </div>
            <h3 className="text-slate-400 text-xs md:text-sm font-medium">{stat.label}</h3>
            <p className="text-xl md:text-2xl font-bold text-white mt-1 tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 glass rounded-2xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base md:text-lg font-bold text-white">Últimos Serviços</h3>
            <button className="text-brand-blue text-xs md:text-sm hover:underline">Ver todos</button>
          </div>
          <div className="space-y-3 md:space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-3 md:p-4 bg-brand-dark/30 rounded-xl border border-brand-border hover:border-slate-700 transition-all">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800 flex items-center justify-center text-brand-blue font-bold text-xs md:text-sm">
                    {item === 1 ? 'M' : item === 2 ? 'S' : 'P'}
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-xs md:text-sm">Mercado Central Ltda</h4>
                    <p className="text-slate-500 text-[10px] md:text-xs">Câmara Fria - Corretiva</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-xs md:text-sm">R$ 450,00</p>
                  <p className="text-slate-500 text-[10px] md:text-xs">Há 2 horas</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 md:p-6">
          <h3 className="text-base md:text-lg font-bold text-white mb-6">Alertas de Manutenção</h3>
          <div className="space-y-3 md:space-y-4">
            <div className="p-3 md:p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
              <AlertTriangle className="text-amber-500 shrink-0 md:w-5 md:h-5" size={18} />
              <div>
                <h4 className="text-amber-200 text-xs md:text-sm font-medium">Preventiva Vencendo</h4>
                <p className="text-amber-200/60 text-[10px] md:text-xs mt-1">Supermercado BH - Unidade 04</p>
              </div>
            </div>
            <div className="p-3 md:p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3">
              <AlertTriangle className="text-red-500 shrink-0 md:w-5 md:h-5" size={18} />
              <div>
                <h4 className="text-red-200 text-xs md:text-sm font-medium">Chamado Urgente</h4>
                <p className="text-red-200/60 text-[10px] md:text-xs mt-1">Restaurante Sabor & Cia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
