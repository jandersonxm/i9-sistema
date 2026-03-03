import React, { useState } from 'react';

export default function App() {
  const [os, setOs] = useState({
    cliente: '',
    equipamento: 'Câmara Fria (Congelados)',
    pressaoBaixa: '',
    tempSuc_Util: '', // Temperatura na saída do evaporador
    tempSuc_Total: '', // Temperatura antes do compressor
    tempArEntrada: '', // Para o Delta T
    tempArSaida: '',   // Para o Delta T
    tecnico: 'Janderson Mendes'
  });

  const [diagnostico, setDiagnostico] = useState<any>(null);

  const calcularTudo = () => {
    // Cálculo de T. Saturação (Simplificado para R404A)
    const tSat = (Number(os.pressaoBaixa) * 0.4) - 45;
    
    // Superaquecimentos
    const shUtil = Number(os.tempSuc_Util) - tSat;
    const shTotal = Number(os.tempSuc_Total) - tSat;
    
    // Delta T do Evaporador
    const deltaT = Number(os.tempArEntrada) - Number(os.tempArSaida);

    setDiagnostico({ shUtil, shTotal, deltaT });
  };

  const enviarWhatsApp = () => {
    const mensagem = `*Relatório i9Manutenção*%0A*Cliente:* ${os.cliente}%0A*Equipamento:* ${os.equipamento}%0A---%0A*SH Útil:* ${diagnostico?.shUtil.toFixed(2)}K%0A*SH Total:* ${diagnostico?.shTotal.toFixed(2)}K%0A*Delta T:* ${diagnostico?.deltaT.toFixed(2)}K%0A---%0A*Técnico:* ${os.tecnico}`;
    window.open(`https://wa.me/5592981340535?text=${mensagem}`, '_blank');
  };

  const inputStyle = { width: '100%', padding: '10px', margin: '5px 0', borderRadius: '4px', border: '1px solid #1e3a8a', backgroundColor: '#0a192f', color: '#fff' };
  const btnStyle = { width: '100%', padding: '12px', backgroundColor: '#00d4ff', border: 'none', color: '#0a192f', fontWeight: 'bold' as const, borderRadius: '5px', marginTop: '10px', cursor: 'pointer' };

  return (
    <div style={{ backgroundColor: '#0a192f', color: '#fff', padding: '20px', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#00d4ff', textAlign: 'center' }}>i9Manutenção v2.0</h2>
      
      <div style={{ backgroundColor: '#112240', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
        <input type="text" style={inputStyle} placeholder="Nome do Cliente" onChange={(e) => setOs({...os, cliente: e.target.value})} />
        <select style={inputStyle} onChange={(e) => setOs({...os, equipamento: e.target.value})}>
          <option>Câmara Fria (Congelados)</option>
          <option>Ilha de Congelados</option>
          <option>Balcão / Expositor</option>
        </select>
      </div>

      <div style={{ padding: '15px', border: '1px solid #00d4ff', borderRadius: '8px', backgroundColor: '#112240' }}>
        <h4 style={{ color: '#64ffda', marginTop: 0 }}>Parâmetros Frigoríficos</h4>
        <input type="number" style={inputStyle} placeholder="Pressão Baixa (PSI)" onChange={(e) => setOs({...os, pressaoBaixa: e.target.value})} />
        <input type="number" style={inputStyle} placeholder="Temp. Saída Evaporador (°C)" onChange={(e) => setOs({...os, tempSuc_Util: e.target.value})} />
        <input type="number" style={inputStyle} placeholder="Temp. Antes Compressor (°C)" onChange={(e) => setOs({...os, tempSuc_Total: e.target.value})} />
        
        <h4 style={{ color: '#64ffda', marginBottom: '5px' }}>Delta T (Ar)</h4>
        <input type="number" style={inputStyle} placeholder="Temp. Ar Entrada (°C)" onChange={(e) => setOs({...os, tempArEntrada: e.target.value})} />
        <input type="number" style={inputStyle} placeholder="Temp. Ar Saída (°C)" onChange={(e) => setOs({...os, tempArSaida: e.target.value})} />
        
        <button onClick={calcularTudo} style={btnStyle}>Calcular Diagnóstico</button>
      </div>

      {diagnostico && (
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#172a45', borderRadius: '8px', borderLeft: '5px solid #64ffda' }}>
          <p>SH Útil: <strong>{diagnostico.shUtil.toFixed(1)}K</strong> (Alvo: 5-8K)</p>
          <p>SH Total: <strong>{diagnostico.shTotal.toFixed(1)}K</strong> (Alvo: 10-20K)</p>
          <p>Delta T: <strong>{diagnostico.deltaT.toFixed(1)}K</strong> (Alvo: 4-6K)</p>
          <button onClick={enviarWhatsApp} style={{ ...btnStyle, backgroundColor: '#28a745', marginTop: '15px' }}>Finalizar e Enviar via WhatsApp</button>
        </div>
      )}

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#64ffda' }}>Técnico: {os.tecnico}</p>
    </div>
  );
}
