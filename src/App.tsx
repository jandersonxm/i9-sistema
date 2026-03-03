import React, { useState } from 'react';

export default function App() {
  const [os, setOs] = useState({
    cliente: '',
    equipamento: 'Câmara Fria',
    urgencia: 'Normal',
    pressaoBaixa: '',
    tempSucção: '',
    tecnico: 'Janderson Mendes' // Sua identidade profissional i9
  });

  const [resultadoSH, setResultadoSH] = useState<number | null>(null);

  const calcularSH = () => {
    // Lógica simplificada para R404A: ajuste fino para Manaus
    const tSat = (Number(os.pressaoBaixa) * 0.4) - 45;
    const sh = Number(os.tempSucção) - tSat;
    setResultadoSH(sh);
  };

  const btnStyle = { width: '100%', padding: '12px', backgroundColor: '#00d4ff', border: 'none', color: '#0a192f', fontWeight: 'bold' as const, borderRadius: '5px', marginTop: '10px', cursor: 'pointer' };
  const inputStyle = { width: '100%', padding: '10px', margin: '8px 0', borderRadius: '4px', border: '1px solid #1e3a8a', backgroundColor: '#0a192f', color: '#fff' };

  return (
    <div style={{ backgroundColor: '#0a192f', color: '#fff', padding: '20px', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#00d4ff', textAlign: 'center' }}>i9Manutenção v2.0</h2>
      
      <div style={{ backgroundColor: '#112240', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <label>Cliente / Empresa:</label>
        <input type="text" style={inputStyle} placeholder="Ex: Supermercado em Manaus" />

        <label>Equipamento Comercial:</label>
        <select style={inputStyle} onChange={(e) => setOs({...os, equipamento: e.target.value})}>
          <option>Câmara Fria (Resfriados)</option>
          <option>Câmara Fria (Congelados)</option>
          <option>Ilha de Congelados</option>
          <option>Balcão de Carne / Expositor</option>
        </select>

        <label>Nível de Urgência:</label>
        <select style={{...inputStyle, color: os.urgencia === 'EMERGÊNCIA' ? '#ff4d4d' : '#fff'}} 
                onChange={(e) => setOs({...os, urgencia: e.target.value})}>
          <option>Normal</option>
          <option>EMERGÊNCIA (Risco de Perda)</option>
        </select>
      </div>

      <div style={{ padding: '15px', border: '1px solid #00d4ff', borderRadius: '8px', backgroundColor: '#112240' }}>
        <h4 style={{ color: '#64ffda', marginTop: 0 }}>Diagnóstico de Precisão (SH)</h4>
        <input type="number" style={inputStyle} placeholder="Pressão de Baixa (PSI)" onChange={(e) => setOs({...os, pressaoBaixa: e.target.value})} />
        <input type="number" style={inputStyle} placeholder="Temp. Sucção (°C)" onChange={(e) => setOs({...os, tempSucção: e.target.value})} />
        <button onClick={calcularSH} style={btnStyle}>Calcular Superaquecimento</button>
        
        {resultadoSH !== null && (
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#0a192f', borderRadius: '5px', borderLeft: '4px solid #64ffda' }}>
            <p>SH Útil: <strong>{resultadoSH.toFixed(2)} K</strong></p>
            <p style={{ fontSize: '14px' }}>{resultadoSH > 8 ? "⚠️ Abrir válvula 1/4 volta" : resultadoSH < 5 ? "⚠️ Fechar válvula 1/2 volta" : "✅ Sistema em Equilíbrio"}</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#8892b0' }}>Técnico Responsável:</p>
        <p style={{ fontWeight: 'bold', color: '#64ffda' }}>{os.tecnico}</p>
        <button style={{ ...btnStyle, backgroundColor: '#28a745' }}>Finalizar e Enviar via WhatsApp</button>
      </div>
    </div>
  );
}
