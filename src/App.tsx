import React, { useState } from 'react';

export default function App() {
  const [os, setOs] = useState({
    cliente: '',
    equipamento: 'Câmara Fria (Congelados)',
    shEncontrado: '',
    dtEncontrado: '',
    tecnico: 'Janderson Xavier Mendes'
  });

  const [relatorio, setRelatorio] = useState<any>(null);

  const gerarDiagnostico = () => {
    const sh = Number(os.shEncontrado);
    const dt = Number(os.dtEncontrado);
    
    // Lógica de ajuste da Válvula de Expansão (VE)
    let acaoVE = "";
    if (sh > 8) acaoVE = "ABRIR a Válvula de Expansão (1/4 de volta por vez).";
    else if (sh < 5) acaoVE = "FECHAR a Válvula de Expansão (1/2 volta por vez).";
    else acaoVE = "Válvula está com ajuste ideal.";

    // Tradução para o Cliente
    let statusGeral = "";
    if (sh >= 5 && sh <= 8 && dt >= 4 && dt <= 7) {
      statusGeral = "O sistema está operando em alta eficiência. Rendimento térmico excelente.";
    } else {
      statusGeral = "Detectamos uma irregularidade no fluxo de fluido. É necessário ajuste técnico para evitar danos ao compressor e excesso de consumo de energia.";
    }

    setRelatorio({ acaoVE, statusGeral, sh, dt });
  };

  const enviarWhatsApp = () => {
    const msg = `*LAUDO TÉCNICO - i9Manutenção*%0A%0A` +
                `*Cliente:* ${os.cliente}%0A` +
                `*Equipamento:* ${os.equipamento}%0A%0A` +
                `*Parecer Técnico:* ${relatorio.statusGeral}%0A%0A` +
                `*Dica do Técnico:* Manter o setpoint e evitar aberturas constantes de porta.%0A%0A` +
                `_Relatório gerado por i9Manutenção v2.5_`;
    window.open(`https://wa.me/5592981340535?text=${msg}`, '_blank');
  };

  const inputStyle = { width: '100%', padding: '12px', margin: '8px 0', borderRadius: '6px', border: '1px solid #1e3a8a', backgroundColor: '#0a192f', color: '#fff' };
  const btnStyle = { width: '100%', padding: '14px', backgroundColor: '#00d4ff', border: 'none', color: '#0a192f', fontWeight: 'bold' as const, borderRadius: '6px', marginTop: '10px', cursor: 'pointer' };

  return (
    <div style={{ backgroundColor: '#0a192f', color: '#fff', padding: '20px', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#00d4ff', textAlign: 'center', marginBottom: '5px' }}>i9Manutenção</h2>
      <p style={{ textAlign: 'center', fontSize: '12px', color: '#64ffda', marginTop: 0 }}>Gestão de Refrigeração Comercial</p>
      
      <div style={{ backgroundColor: '#112240', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <input type="text" placeholder="Nome do Cliente/Estabelecimento" style={inputStyle} onChange={(e) => setOs({...os, cliente: e.target.value})} />
        <select style={inputStyle} onChange={(e) => setOs({...os, equipamento: e.target.value})}>
          <option>Câmara Fria (Congelados)</option>
          <option>Câmara Fria (Resfriados)</option>
          <option>Ilha de Congelados</option>
          <option>Balcão Expositor</option>
        </select>
      </div>

      <div style={{ padding: '15px', border: '1px solid #00d4ff', borderRadius: '8px', backgroundColor: '#112240' }}>
        <h4 style={{ color: '#64ffda', marginTop: 0 }}>Dados da Régua Danfoss</h4>
        <label style={{ fontSize: '12px' }}>Superaquecimento Útil (K):</label>
        <input type="number" placeholder="Ex: 12" style={inputStyle} onChange={(e) => setOs({...os, shEncontrado: e.target.value})} />
        
        <label style={{ fontSize: '12px' }}>Delta T do Ar (Entrada - Saída):</label>
        <input type="number" placeholder="Ex: 5" style={inputStyle} onChange={(e) => setOs({...os, dtEncontrado: e.target.value})} />
        
        <button onClick={gerarDiagnostico} style={btnStyle}>GERAR RELATÓRIO PROFISSIONAL</button>
      </div>

      {relatorio && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#172a45', borderRadius: '8px', borderLeft: '6px solid #64ffda' }}>
          <h4 style={{ color: '#00d4ff', marginTop: 0 }}>Área do Técnico (Seu Guia):</h4>
          <p style={{ backgroundColor: '#0a192f', padding: '10px', borderRadius: '4px' }}>👉 <strong>Ação:</strong> {relatorio.acaoVE}</p>
          
          <h4 style={{ color: '#00d4ff', marginBottom: '5px' }}>Prévia para o Cliente:</h4>
          <p style={{ fontStyle: 'italic', fontSize: '14px' }}>"{relatorio.statusGeral}"</p>
          
          <button onClick={enviarWhatsApp} style={{ ...btnStyle, backgroundColor: '#28a745' }}>ENVIAR LAUDO PARA CLIENTE</button>
        </div>
      )}
    </div>
  );
}
