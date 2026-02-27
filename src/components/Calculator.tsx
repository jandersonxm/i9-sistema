import React, { useState, useMemo } from 'react';
import { 
  Maximize, 
  Thermometer, 
  Box, 
  Zap,
  Info,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';

const PRODUCTS = [
  { id: 'carne', label: 'Carne', cp: 0.75, tempEntrada: 5 },
  { id: 'frango', label: 'Frango', cp: 0.70, tempEntrada: 4 },
  { id: 'bebidas', label: 'Bebidas', cp: 0.90, tempEntrada: 25 },
  { id: 'gelo', label: 'Gelo', cp: 0.50, tempEntrada: 0 },
];

export default function ColdRoomCalculator() {
  const [inputs, setInputs] = useState({
    length: '',
    width: '',
    height: '',
    tempExt: '35',
    tempInt: '-18',
    productId: 'carne',
    quantity: ''
  });

  const results = useMemo(() => {
    const l = parseFloat(inputs.length) || 0;
    const w = parseFloat(inputs.width) || 0;
    const h = parseFloat(inputs.height) || 0;
    const tExt = parseFloat(inputs.tempExt) || 0;
    const tInt = parseFloat(inputs.tempInt) || 0;
    const qty = parseFloat(inputs.quantity) || 0;
    const product = PRODUCTS.find(p => p.id === inputs.productId)!;

    if (!l || !w || !h) return null;

    // 1. Área Total (m²) - Para painéis
    const areaTotal = 2 * (l * w + l * h + w * h);
    
    // 2. Volume (m³)
    const volume = l * w * h;

    // 3. Carga Transmissão (kcal/24h)
    const cargaTransmissao = areaTotal * 24 * (tExt - tInt) * 0.023;

    // 4. Carga Produto (kcal/24h)
    const cargaProduto = qty * product.cp * (product.tempEntrada - tInt);

    // 5. Total com Fator de Segurança (+20%)
    const totalKcal24h = (cargaTransmissao + cargaProduto) * 1.2;

    // 6. Compensação (18h de funcionamento)
    const kcalH = totalKcal24h / 18;

    // 7. Conversão para BTU/h
    const btuH = kcalH * 3.968;

    // 8. Sugestão de Máquina (HP)
    let hp = 0;
    if (btuH <= 9000) hp = 1;
    else if (btuH <= 18000) hp = 2;
    else if (btuH <= 27000) hp = 3;
    else if (btuH <= 36000) hp = 4;
    else hp = Math.ceil(btuH / 9000);

    // 9. Lista de Materiais (Estimativa)
    const materiais = [
      { item: 'Painéis Isotérmicos (150mm)', qtd: `${Math.ceil(areaTotal * 1.05)} m²`, obs: 'Inclui 5% de quebra' },
      { item: 'Cantoneiras Internas/Externas', qtd: `${Math.ceil((l*4 + w*4 + h*4))} m`, obs: 'Perímetro total' },
      { item: 'Silicone Selante', qtd: `${Math.ceil(areaTotal / 10)} tubos`, obs: 'Estimativa p/ vedação' },
      { item: 'Rebites de Alumínio', qtd: `${Math.ceil(areaTotal * 10)} un`, obs: 'Fixação de cantoneiras' },
      { item: 'Porta Giratória/Correr', qtd: '01 un', obs: 'Padrão 0,80 x 1,80m' },
    ];

    return {
      area: areaTotal.toFixed(2),
      volume: volume.toFixed(2),
      btu: Math.round(btuH),
      hp: hp,
      materiais
    };
  }, [inputs]);

  return (
    <div className="max-w-5xl mx-auto px-1 md:px-0">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="w-10 h-10 md:w-14 md:h-14 bg-brand-blue rounded-xl md:rounded-2xl flex items-center justify-center neon-glow">
          <Thermometer className="text-brand-dark w-6 h-6 md:w-8 md:h-8" />
        </div>
        <div>
          <h2 className="text-xl md:text-3xl font-bold text-white">Orçamento de Câmara Fria</h2>
          <p className="text-slate-400 text-xs md:text-base">Dimensionamento térmico e lista de materiais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Inputs Section */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="glass rounded-2xl p-5 md:p-6 space-y-6 md:space-y-8">
            {/* Dimensions */}
            <section>
              <div className="flex items-center gap-2 mb-4 text-brand-blue">
                <Maximize size={16} className="md:w-4.5 md:h-4.5" />
                <h3 className="font-semibold uppercase tracking-wider text-[10px] md:text-xs">Dimensões da Câmara (Metros)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] md:text-xs text-slate-500 mb-1">Comprimento</label>
                  <input
                    type="number"
                    value={inputs.length}
                    onChange={e => setInputs({...inputs, length: e.target.value})}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base text-white neon-border"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs text-slate-500 mb-1">Largura</label>
                  <input
                    type="number"
                    value={inputs.width}
                    onChange={e => setInputs({...inputs, width: e.target.value})}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base text-white neon-border"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs text-slate-500 mb-1">Altura</label>
                  <input
                    type="number"
                    value={inputs.height}
                    onChange={e => setInputs({...inputs, height: e.target.value})}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base text-white neon-border"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </section>

            {/* Temperatures */}
            <section>
              <div className="flex items-center gap-2 mb-4 text-brand-blue">
                <Thermometer size={16} className="md:w-4.5 md:h-4.5" />
                <h3 className="font-semibold uppercase tracking-wider text-[10px] md:text-xs">Temperaturas (°C)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] md:text-xs text-slate-500 mb-1">Externa (Ambiente)</label>
                  <input
                    type="number"
                    value={inputs.tempExt}
                    onChange={e => setInputs({...inputs, tempExt: e.target.value})}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base text-white neon-border"
                  />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs text-slate-500 mb-1">Interna (Desejada)</label>
                  <input
                    type="number"
                    value={inputs.tempInt}
                    onChange={e => setInputs({...inputs, tempInt: e.target.value})}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base text-white neon-border"
                  />
                </div>
              </div>
            </section>

            {/* Product */}
            <section>
              <div className="flex items-center gap-2 mb-4 text-brand-blue">
                <Box size={16} className="md:w-4.5 md:h-4.5" />
                <h3 className="font-semibold uppercase tracking-wider text-[10px] md:text-xs">Produto e Movimentação</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] md:text-xs text-slate-500 mb-1">Tipo de Produto</label>
                  <select
                    value={inputs.productId}
                    onChange={e => setInputs({...inputs, productId: e.target.value})}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base text-white neon-border"
                  >
                    {PRODUCTS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs text-slate-500 mb-1">Quantidade (kg/dia)</label>
                  <input
                    type="number"
                    value={inputs.quantity}
                    onChange={e => setInputs({...inputs, quantity: e.target.value})}
                    className="w-full bg-brand-dark border border-brand-border rounded-xl px-4 py-2.5 md:py-3 text-sm md:text-base text-white neon-border"
                    placeholder="0"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
            <Info className="text-blue-400 shrink-0" size={18} />
            <p className="text-[10px] md:text-xs text-blue-200/70 leading-relaxed">
              * Este cálculo utiliza parâmetros médios (K=0.023 para isolamento de 150mm PU) e fator de segurança de 20%. 
              Para projetos complexos, consulte um engenheiro termista.
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4 md:space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-blue rounded-3xl p-6 md:p-8 text-brand-dark shadow-2xl shadow-brand-blue/20 relative overflow-hidden"
          >
            <Zap className="absolute -right-4 -top-4 w-24 h-24 md:w-32 md:h-32 opacity-10 rotate-12" />
            
            <h3 className="text-[10px] md:text-sm font-bold uppercase tracking-widest opacity-60 mb-6 md:mb-8">Resultado Estimado</h3>
            
            <div className="space-y-6 md:space-y-8">
              <div>
                <span className="text-[10px] md:text-xs font-semibold opacity-60 block mb-1">Carga Térmica Necessária</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-5xl font-black tracking-tighter">
                    {results ? results.btu.toLocaleString() : '---'}
                  </span>
                  <span className="text-sm md:text-xl font-bold opacity-80">BTU/h</span>
                </div>
              </div>

              <div className="h-px bg-brand-dark/10" />

              <div>
                <span className="text-[10px] md:text-xs font-semibold opacity-60 block mb-1">Sugestão de Compressor</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-5xl font-black tracking-tighter">
                    {results ? results.hp : '---'}
                  </span>
                  <span className="text-sm md:text-xl font-bold opacity-80">HP</span>
                </div>
              </div>
            </div>

            <button className="w-full bg-brand-dark text-brand-blue font-bold py-3.5 md:py-4 rounded-2xl mt-8 md:mt-10 flex items-center justify-center gap-2 hover:bg-slate-900 transition-all text-sm md:text-base">
              Gerar Memorial Descritivo
              <ArrowRight size={18} />
            </button>
          </motion.div>

          <div className="glass rounded-2xl p-5 md:p-6">
            <h4 className="text-white font-semibold mb-4 text-xs md:text-sm">Resumo do Projeto</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-slate-500">Área de Troca:</span>
                <span className="text-slate-200 font-mono">{results ? results.area : '0'} m²</span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-slate-500">Volume Interno:</span>
                <span className="text-slate-200 font-mono">
                  {results ? results.volume : '0'} m³
                </span>
              </div>
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-slate-500">Delta T:</span>
                <span className="text-slate-200 font-mono">
                  {results ? (parseFloat(inputs.tempExt) - parseFloat(inputs.tempInt)) : '0'} °C
                </span>
              </div>
            </div>
          </div>

          {results && results.materiais && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-5 md:p-6 border border-brand-blue/20"
            >
              <h4 className="text-brand-blue font-bold mb-4 text-xs md:text-sm uppercase tracking-wider">Lista de Materiais</h4>
              <div className="space-y-3">
                {results.materiais.map((mat, idx) => (
                  <div key={idx} className="flex flex-col border-b border-brand-border/50 pb-2 last:border-0">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-xs font-medium">{mat.item}</span>
                      <span className="text-brand-blue font-bold text-xs">{mat.qtd}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 italic">{mat.obs}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
