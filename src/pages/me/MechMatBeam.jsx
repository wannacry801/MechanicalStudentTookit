import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function MechMatBeam() {
  const [beamLength, setBeamLength] = useState(6);
  const [supportA, setSupportA] = useState(0);
  const [supportB, setSupportB] = useState(6);
  const [loadX, setLoadX] = useState(3);
  const [loadP, setLoadP] = useState(10);
  const [reactionA, setReactionA] = useState(0);
  const [reactionB, setReactionB] = useState(0);
  const [diagramData, setDiagramData] = useState([]);

  useEffect(() => {
    const L = parseFloat(beamLength);
    const a = parseFloat(supportA);
    const b = parseFloat(supportB);
    const x = parseFloat(loadX);
    const P = parseFloat(loadP);

    if (isNaN(L) || isNaN(a) || isNaN(b) || isNaN(x) || isNaN(P) || (b - a) === 0) return;

    // คำนวณ Reactions: ΣM_A = 0, ΣF_y = 0
    const Rb = (P * (x - a)) / (b - a);
    const Ra = P - Rb;

    setReactionA(Ra);
    setReactionB(Rb);

    // สร้างกราฟ SFD/BMD โดยการตัด section ทีละขั้น
    const data = [];
    const step = 0.05;
    
    for (let currentX = 0; currentX <= L; currentX += step) {
      let V = 0;
      let M = 0;

      if (currentX >= a) V += Ra;
      if (currentX >= x) V -= P;
      if (currentX >= b) V += Rb;

      if (currentX >= a) M += Ra * (currentX - a);
      if (currentX >= x) M -= P * (currentX - x);
      if (currentX >= b) M += Rb * (currentX - b);

      data.push({
        distance: parseFloat(currentX.toFixed(2)),
        V: parseFloat(V.toFixed(2)),
        M: parseFloat(M.toFixed(2)),
      });
    }

    setDiagramData(data);
  }, [beamLength, supportA, supportB, loadX, loadP]);

  const containerStyle = {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: 20,
    padding: 16,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const leftColStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  };

  const cardStyle = {
    background: '#111827',
    border: '1px solid #1f2937',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  };

  const inputStyle = {
    width: '100%',
    background: '#0d1117',
    border: '1px solid #374151',
    borderRadius: 10,
    padding: '8px 12px',
    textAlign: 'center',
    color: '#60a5fa',
    fontSize: 14,
    fontFamily: 'monospace',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 6,
    fontWeight: 500,
  };

  const headerStyle = {
    fontSize: 12,
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 14,
    display: 'block',
  };

  const resultBoxStyle = {
    padding: 12,
    background: '#0d1117',
    border: '1px solid #1f2937',
    borderRadius: 10,
    textAlign: 'center',
    fontFamily: 'monospace',
  };

  const resultLabelStyle = {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  };

  const resultValueStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: '#6ee7b7',
  };

  const chartContainerStyle = {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 12,
    border: '1px solid #1f2937',
    height: 200,
  };

  return (
    <div style={containerStyle}>
      
      {/* LEFT COLUMN */}
      <div style={leftColStyle}>
        {/* Input Section */}
        <div style={cardStyle}>
          <span style={headerStyle}>Beam Simulator (Ch.7)</span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Beam Length (L - m)</label>
              <input type="number" value={beamLength} onChange={(e) => setBeamLength(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Support A (x_A)</label>
                <input type="number" value={supportA} onChange={(e) => setSupportA(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Support B (x_B)</label>
                <input type="number" value={supportB} onChange={(e) => setSupportB(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #1f2937', paddingTop: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Load Position (x_P)</label>
                  <input type="number" value={loadX} onChange={(e) => setLoadX(e.target.value)} style={{ ...inputStyle, color: '#fbbf24' }} />
                </div>
                <div>
                  <label style={labelStyle}>Force (P - kN)</label>
                  <input type="number" value={loadP} onChange={(e) => setLoadP(e.target.value)} style={{ ...inputStyle, color: '#fbbf24' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reactions */}
        <div style={cardStyle}>
          <span style={headerStyle}>Reaction Results</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={resultBoxStyle}>
              <div style={resultLabelStyle}>R_A (Left)</div>
              <div style={resultValueStyle}>{reactionA.toFixed(2)} kN</div>
            </div>
            <div style={resultBoxStyle}>
              <div style={resultLabelStyle}>R_B (Right)</div>
              <div style={resultValueStyle}>{reactionB.toFixed(2)} kN</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={cardStyle}>
          
          {/* SFD */}
          <div style={{ marginBottom: 24 }}>
            <span style={{ ...headerStyle, color: '#a78bfa' }}>Shear Force Diagram (SFD - kN)</span>
            <div style={chartContainerStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={diagramData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="distance" stroke="#4b5563" fontSize={10} tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }} labelStyle={{ color: '#9ca3af' }} itemStyle={{ color: '#a78bfa' }} />
                  <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />
                  <Line type="stepAfter" dataKey="V" stroke="#a78bfa" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BMD */}
          <div>
            <span style={{ ...headerStyle, color: '#fbbf24' }}>Bending Moment Diagram (BMD - kN·m)</span>
            <div style={chartContainerStyle}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={diagramData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="distance" stroke="#4b5563" fontSize={10} tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }} labelStyle={{ color: '#9ca3af' }} itemStyle={{ color: '#fbbf24' }} />
                  <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />
                  <Line type="monotone" dataKey="M" stroke="#fbbf24" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}