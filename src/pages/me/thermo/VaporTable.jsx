import { useState, useEffect } from 'react';

export default function VaporTable() {
  const [subModule, setSubModule] = useState('saturated_water');
  const [inputType, setInputType] = useState('temp');
  const [inputValue, setInputValue] = useState('100');
  const [pGas, setPGas] = useState('101.3');
  const [tGas, setTGas] = useState('298.15');
  const [rGas, setRGas] = useState('0.287');
  const [results, setResults] = useState({});
  const [error, setError] = useState('');

  const saturatedTable = {
    temp: [
      { t: 0.01, p: 0.611, vf: 0.0010, vg: 206.1, hf: 0, hg: 2500.9 },
      { t: 50, p: 12.35, vf: 0.00101, vg: 12.03, hf: 209.3, hg: 2591.3 },
      { t: 100, p: 101.4, vf: 0.00104, vg: 1.672, hf: 419.1, hg: 2675.6 },
      { t: 150, p: 476.2, vf: 0.00109, vg: 0.392, hf: 632.2, hg: 2745.9 },
      { t: 200, p: 1555, vf: 0.00115, vg: 0.127, hf: 852.3, hg: 2792.0 }
    ],
    press: [
      { p: 10, t: 45.8, vf: 0.00101, vg: 14.67, hf: 191.8, hg: 2583.9 },
      { p: 101.3, t: 100, vf: 0.00104, vg: 1.673, hf: 419.1, hg: 2675.6 },
      { p: 500, t: 151.8, vf: 0.00109, vg: 0.374, hf: 640.1, hg: 2748.1 },
      { p: 1000, t: 179.9, vf: 0.00112, vg: 0.194, hf: 762.6, hg: 2777.1 }
    ]
  };

  const interpolate = (x, x1, x2, y1, y2) => {
    return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
  };

  useEffect(() => {
    setError('');
    const val = parseFloat(inputValue);
    if (isNaN(val)) return;

    if (subModule === 'saturated_water') {
      const dataset = inputType === 'temp' ? saturatedTable.temp : saturatedTable.press;
      const key = inputType === 'temp' ? 't' : 'p';

      if (val < dataset[0][key] || val > dataset[dataset.length - 1][key]) {
        setError('ค่าอยู่นอกขอบเขตตารางจำลอง (ลองกรอก Temp 0-200 หรือ Press 10-1000)');
        return;
      }

      let index = 0;
      for (let i = 0; i < dataset.length - 1; i++) {
        if (val >= dataset[i][key] && val <= dataset[i + 1][key]) {
          index = i;
          break;
        }
      }

      const p1 = dataset[index];
      const p2 = dataset[index + 1];

      const t_ans = inputType === 'temp' ? val : interpolate(val, p1.p, p2.p, p1.t, p2.t);
      const p_ans = inputType === 'press' ? val : interpolate(val, p1.t, p2.t, p1.p, p2.p);
      const hf_ans = interpolate(val, p1[key], p2[key], p1.hf, p2.hf);
      const hg_ans = interpolate(val, p1[key], p2[key], p1.hg, p2.hg);
      const vg_ans = interpolate(val, p1[key], p2[key], p1.vg, p2.vg);

      setResults({
        temperature: `${t_ans.toFixed(2)} °C`,
        pressure: `${p_ans.toFixed(2)} kPa`,
        hf: `${hf_ans.toFixed(1)} kJ/kg`,
        hg: `${hg_ans.toFixed(1)} kJ/kg`,
        vg: `${vg_ans.toFixed(4)} m³/kg`
      });
    } else if (subModule === 'ideal_gas') {
      const P = parseFloat(pGas);
      const T = parseFloat(tGas);
      const R = parseFloat(rGas);
      if (P > 0 && T > 0 && R > 0) {
        const density = P / (R * T);
        const specVol = 1 / density;
        setResults({
          density: `${density.toFixed(3)} kg/m³`,
          specVol: `${specVol.toFixed(4)} m³/kg`
        });
      }
    }
  }, [subModule, inputType, inputValue, pGas, tGas, rGas]);

  const containerStyle = {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 16,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const tabsStyle = {
    display: 'flex',
    background: '#111827',
    padding: 6,
    borderRadius: 16,
    border: '1px solid #1f2937',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    gap: 6,
  };

  const tabButtonStyle = (isActive) => ({
    flex: 1,
    padding: '12px 16px',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? '#fff' : '#6b7280',
  });

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1.4fr',
    gap: 24,
  };

  const cardStyle = {
    padding: 20,
    background: '#111827',
    border: '1px solid #1f2937',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  };

  const headerStyle = {
    fontSize: 12,
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 14,
  };

  const inputLabelStyle = {
    display: 'block',
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: 500,
  };

  const inputStyle = {
    width: '100%',
    background: '#0d1117',
    border: '1px solid #374151',
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#60a5fa',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const typeToggleStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    background: '#0d1117',
    padding: 4,
    borderRadius: 10,
    marginBottom: 14,
    border: '1px solid #1f2937',
  };

  const typeButtonStyle = (isActive) => ({
    padding: '8px 12px',
    fontSize: 11,
    fontWeight: 600,
    borderRadius: 8,
    border: isActive ? '1px solid #3b82f6' : '1px solid transparent',
    background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
    color: isActive ? '#60a5fa' : '#6b7280',
    cursor: 'pointer',
    fontFamily: 'monospace',
  });

  const resultBoxStyle = {
    padding: 12,
    background: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
    border: '1px solid #1f2937',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 12,
    fontFamily: 'monospace',
  };

  const resultLabelStyle = {
    color: '#6b7280',
  };

  const resultValueStyle = {
    color: '#6ee7b7',
    fontWeight: 700,
  };

  const errorStyle = {
    padding: 12,
    background: 'rgba(127,29,29,0.3)',
    border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: 10,
    color: '#f87171',
    fontSize: 12,
    fontFamily: 'monospace',
  };

  return (
    <div style={containerStyle}>
      
      {/* Tabs */}
      <div style={tabsStyle}>
        <button style={tabButtonStyle(subModule === 'saturated_water')} onClick={() => setSubModule('saturated_water')}>
          Saturated Water Table
        </button>
        <button style={tabButtonStyle(subModule === 'superheated_steam')} onClick={() => setSubModule('superheated_steam')}>
          Superheated Vapor (Soon)
        </button>
        <button style={tabButtonStyle(subModule === 'ideal_gas')} onClick={() => setSubModule('ideal_gas')}>
          Ideal Gas Solver
        </button>
      </div>

      {/* Main Content */}
      <div style={gridStyle}>
        
        {/* LEFT: Input */}
        <div style={cardStyle}>
          <div style={headerStyle}>Property Input</div>

          {subModule === 'saturated_water' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={typeToggleStyle}>
                <button style={typeButtonStyle(inputType === 'temp')} onClick={() => { setInputType('temp'); setInputValue('100'); }}>
                  Temperature (°C)
                </button>
                <button style={typeButtonStyle(inputType === 'press')} onClick={() => { setInputType('press'); setInputValue('101.3'); }}>
                  Pressure (kPa)
                </button>
              </div>
              <div>
                <label style={inputLabelStyle}>Enter Value ({inputType === 'temp' ? '°C' : 'kPa'})</label>
                <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} style={inputStyle} />
              </div>
            </div>
          )}

          {subModule === 'ideal_gas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={inputLabelStyle}>Pressure (P - kPa)</label>
                <input type="number" value={pGas} onChange={(e) => setPGas(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={inputLabelStyle}>Temperature (T - K)</label>
                <input type="number" value={tGas} onChange={(e) => setTGas(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={inputLabelStyle}>Gas Constant R (kJ/kg·K)</label>
                <input type="number" value={rGas} onChange={(e) => setRGas(e.target.value)} style={inputStyle} />
              </div>
            </div>
          )}

          {subModule === 'superheated_steam' && (
            <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 13, fontStyle: 'italic', padding: '32px 0' }}>
              Superheated vapor properties coming soon
            </div>
          )}
        </div>

        {/* RIGHT: Results */}
        <div style={cardStyle}>
          <div style={headerStyle}>Thermodynamic Properties</div>

          {error && <div style={errorStyle}>{error}</div>}

          {subModule === 'saturated_water' && !error && Object.keys(results).length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={resultBoxStyle}>
                <span style={resultLabelStyle}>Sat Temperature (T)</span>
                <span style={{ color: '#60a5fa', fontWeight: 700 }}>{results.temperature}</span>
              </div>
              <div style={resultBoxStyle}>
                <span style={resultLabelStyle}>Sat Pressure (P)</span>
                <span style={{ color: '#60a5fa', fontWeight: 700 }}>{results.pressure}</span>
              </div>
              <div style={{ ...resultBoxStyle, marginTop: 8, borderTop: '1px solid #374151', paddingTop: 12 }}>
                <span style={{ color: '#a78bfa', fontWeight: 700 }}>hf (Enthalpy Liquid)</span>
                <span style={resultValueStyle}>{results.hf}</span>
              </div>
              <div style={resultBoxStyle}>
                <span style={{ color: '#a78bfa', fontWeight: 700 }}>hg (Enthalpy Vapor)</span>
                <span style={resultValueStyle}>{results.hg}</span>
              </div>
              <div style={resultBoxStyle}>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>vg (Spec. Vol. Vapor)</span>
                <span style={resultValueStyle}>{results.vg}</span>
              </div>
            </div>
          )}

          {subModule === 'ideal_gas' && Object.keys(results).length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={resultBoxStyle}>
                <span style={resultLabelStyle}>Gas Density (ρ)</span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>{results.density}</span>
              </div>
              <div style={resultBoxStyle}>
                <span style={resultLabelStyle}>Specific Volume (v)</span>
                <span style={resultValueStyle}>{results.specVol}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}