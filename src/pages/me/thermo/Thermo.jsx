import { useState, useEffect } from 'react';

export default function ThermodynamicsCalculator() {
  const [module, setModule] = useState('saturated');
  const [results, setResults] = useState({});
  const [error, setError] = useState('');

  // ========== SATURATED WATER TABLE ==========
  const [inputType, setInputType] = useState('temp');
  const [inputValue, setInputValue] = useState('100');

  const saturatedTable = {
    temp: [
      { t: 0.01, p: 0.611, vf: 0.0010, vg: 206.1, hf: 0, hg: 2500.9, sf: 0, sg: 9.155 },
      { t: 50, p: 12.35, vf: 0.00101, vg: 12.03, hf: 209.3, hg: 2591.3, sf: 0.704, sg: 8.948 },
      { t: 100, p: 101.4, vf: 0.00104, vg: 1.672, hf: 417.4, hg: 2675.6, sf: 1.307, sg: 7.355 },
      { t: 150, p: 476.2, vf: 0.00109, vg: 0.392, hf: 632.2, hg: 2745.9, sf: 1.841, sg: 6.441 },
      { t: 200, p: 1555, vf: 0.00115, vg: 0.127, hf: 852.3, hg: 2792.0, sf: 2.315, sg: 5.847 }
    ]
  };

  // ========== POLYTROPIC PROCESS ==========
  const [poly_p1, setPoly_p1] = useState('100');
  const [poly_v1, setPoly_v1] = useState('1.0');
  const [poly_p2, setPoly_p2] = useState('200');
  const [poly_n, setPoly_n] = useState('1.4');

  // ========== ISENTROPIC PROCESS ==========
  const [isen_t1, setIsen_t1] = useState('300');
  const [isen_p1, setIsen_p1] = useState('100');
  const [isen_p2, setIsen_p2] = useState('200');
  const [isen_k, setIsen_k] = useState('1.4');

  // ========== STEAM QUALITY ==========
  const [steam_h, setSteam_h] = useState('2000');
  const [steam_temp, setSteam_temp] = useState('100');

  // ========== FIRST LAW ENERGY BALANCE ==========
  const [energy_m, setEnergy_m] = useState('1.0');
  const [energy_h1, setEnergy_h1] = useState('100');
  const [energy_h2, setEnergy_h2] = useState('2000');
  const [energy_w, setEnergy_w] = useState('0');

  // ========== EFFICIENCY CALCULATOR ==========
  const [eff_w_out, setEff_w_out] = useState('100');
  const [eff_w_ideal, setEff_w_ideal] = useState('110');
  const [eff_q_in, setEff_q_in] = useState('500');

  const interpolate = (x, x1, x2, y1, y2) => {
    return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
  };

  useEffect(() => {
    setError('');
    let res = {};

    if (module === 'saturated') {
      const val = parseFloat(inputValue);
      const dataset = saturatedTable.temp;
      const key = 'temp' ? 't' : 'p';

      if (isNaN(val) || val < dataset[0].t || val > dataset[dataset.length - 1].t) {
        setError('ค่าอยู่นอกช่วง 0.01-200°C');
        return;
      }

      let index = 0;
      for (let i = 0; i < dataset.length - 1; i++) {
        if (val >= dataset[i].t && val <= dataset[i + 1].t) {
          index = i;
          break;
        }
      }

      const p1 = dataset[index];
      const p2 = dataset[index + 1];
      const hf = interpolate(val, p1.t, p2.t, p1.hf, p2.hf);
      const hg = interpolate(val, p1.t, p2.t, p1.hg, p2.hg);
      const vg = interpolate(val, p1.t, p2.t, p1.vg, p2.vg);
      const p = interpolate(val, p1.t, p2.t, p1.p, p2.p);
      const sf = interpolate(val, p1.t, p2.t, p1.sf, p2.sf);
      const sg = interpolate(val, p1.t, p2.t, p1.sg, p2.sg);

      res = {
        temperature: `${val.toFixed(2)} °C`,
        pressure: `${p.toFixed(2)} kPa`,
        hf: `${hf.toFixed(1)} kJ/kg`,
        hg: `${hg.toFixed(1)} kJ/kg`,
        vg: `${vg.toFixed(4)} m³/kg`,
        sf: `${sf.toFixed(3)} kJ/kg·K`,
        sg: `${sg.toFixed(3)} kJ/kg·K`
      };

    } else if (module === 'polytropic') {
      const P1 = parseFloat(poly_p1);
      const V1 = parseFloat(poly_v1);
      const P2 = parseFloat(poly_p2);
      const n = parseFloat(poly_n);

      if (P1 > 0 && V1 > 0 && P2 > 0 && n > 0) {
        // P1*V1^n = P2*V2^n
        const V2 = V1 * Math.pow(P1 / P2, 1 / n);
        // W = (P2*V2 - P1*V1) / (1-n)
        const W = (P2 * V2 - P1 * V1) / (1 - n);
        
        res = {
          V2: `${V2.toFixed(4)} m³`,
          work: `${W.toFixed(2)} kJ`,
          workType: W > 0 ? '(ต้องให้งาน - Compression)' : '(ได้งาน - Expansion)'
        };
      }

    } else if (module === 'isentropic') {
      const T1 = parseFloat(isen_t1);
      const P1 = parseFloat(isen_p1);
      const P2 = parseFloat(isen_p2);
      const k = parseFloat(isen_k);

      if (T1 > 0 && P1 > 0 && P2 > 0 && k > 1) {
        // T2/T1 = (P2/P1)^((k-1)/k)
        const T2 = T1 * Math.pow(P2 / P1, (k - 1) / k);
        const dT = T2 - T1;
        
        res = {
          T2: `${T2.toFixed(2)} K`,
          deltaT: `${dT.toFixed(2)} K`,
          processType: 'Isentropic (Reversible & Adiabatic)'
        };
      }

    } else if (module === 'quality') {
      const h = parseFloat(steam_h);
      const t = parseFloat(steam_temp);

      const dataset = saturatedTable.temp;
      let index = 0;
      for (let i = 0; i < dataset.length - 1; i++) {
        if (t >= dataset[i].t && t <= dataset[i + 1].t) {
          index = i;
          break;
        }
      }

      const p1 = dataset[index];
      const p2 = dataset[index + 1];
      const hf = interpolate(t, p1.t, p2.t, p1.hf, p2.hf);
      const hg = interpolate(t, p1.t, p2.t, p1.hg, p2.hg);
      const hfg = hg - hf;
      const x = (h - hf) / hfg;

      if (x >= 0 && x <= 1) {
        res = {
          hf: `${hf.toFixed(1)} kJ/kg`,
          hg: `${hg.toFixed(1)} kJ/kg`,
          quality: `${(x * 100).toFixed(1)} %`,
          state: x === 0 ? 'Saturated Liquid' : x === 1 ? 'Saturated Vapor' : 'Two-phase Mixture'
        };
      } else {
        setError('Enthalpy ไม่อยู่ในช่วง Saturated (Superheated or Compressed)');
      }

    } else if (module === 'firstlaw') {
      const m = parseFloat(energy_m);
      const h1 = parseFloat(energy_h1);
      const h2 = parseFloat(energy_h2);
      const W = parseFloat(energy_w);

      if (m > 0) {
        const dH = m * (h2 - h1);
        const Q = dH + W;

        res = {
          deltaH: `${dH.toFixed(2)} kJ`,
          Q: `${Q.toFixed(2)} kJ`,
          processType: Q > 0 ? 'Heat INPUT' : 'Heat OUTPUT',
          equation: 'Q = ΔH + W (or Q = ΔU + P*ΔV)'
        };
      }

    } else if (module === 'efficiency') {
      const W_out = parseFloat(eff_w_out);
      const W_ideal = parseFloat(eff_w_ideal);
      const Q_in = parseFloat(eff_q_in);

      if (W_out > 0 && W_ideal > 0 && Q_in > 0) {
        const isen_eff = (W_out / W_ideal) * 100;
        const thermal_eff = (W_out / Q_in) * 100;

        res = {
          isentropic_eff: `${isen_eff.toFixed(2)} %`,
          thermal_eff: `${thermal_eff.toFixed(2)} %`,
          definition: 'η_isentropic = W_actual / W_ideal',
          definition2: 'η_thermal = W_net / Q_in'
        };
      }
    }

    setResults(res);
  }, [module, inputValue, poly_p1, poly_v1, poly_p2, poly_n, isen_t1, isen_p1, isen_p2, isen_k, steam_h, steam_temp, energy_m, energy_h1, energy_h2, energy_w, eff_w_out, eff_w_ideal, eff_q_in]);

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
    gap: 6,
    background: '#111827',
    padding: 6,
    borderRadius: 16,
    border: '1px solid #1f2937',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    overflowX: 'auto',
  };

  const tabButtonStyle = (isActive) => ({
    padding: '10px 14px',
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    background: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? '#fff' : '#6b7280',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
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
    fontSize: 15,
    fontFamily: 'monospace',
    color: '#60a5fa',
    boxSizing: 'border-box',
    outline: 'none',
    marginBottom: 10,
  };

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
    marginBottom: 8,
  };

  const errorStyle = {
    padding: 12,
    background: 'rgba(127,29,29,0.3)',
    border: '1px solid rgba(239,68,68,0.4)',
    borderRadius: 10,
    color: '#f87171',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 14,
  };

  return (
    <div style={containerStyle}>
      
      {/* TABS */}
      <div style={tabsStyle}>
        <button style={tabButtonStyle(module === 'saturated')} onClick={() => setModule('saturated')}>
          Saturated Water
        </button>
        <button style={tabButtonStyle(module === 'polytropic')} onClick={() => setModule('polytropic')}>
          Polytropic Process
        </button>
        <button style={tabButtonStyle(module === 'isentropic')} onClick={() => setModule('isentropic')}>
          Isentropic Process
        </button>
        <button style={tabButtonStyle(module === 'quality')} onClick={() => setModule('quality')}>
          Steam Quality (x)
        </button>
        <button style={tabButtonStyle(module === 'firstlaw')} onClick={() => setModule('firstlaw')}>
          First Law (Energy)
        </button>
        <button style={tabButtonStyle(module === 'efficiency')} onClick={() => setModule('efficiency')}>
          Efficiency (η)
        </button>
      </div>

      {/* CONTENT */}
      <div style={gridStyle}>
        
        {/* LEFT: INPUTS */}
        <div style={cardStyle}>
          <div style={headerStyle}>Inputs</div>

          {module === 'saturated' && (
            <>
              <label style={inputLabelStyle}>Temperature (°C)</label>
              <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} style={inputStyle} placeholder="0.01 - 200" />
            </>
          )}

          {module === 'polytropic' && (
            <>
              <label style={inputLabelStyle}>P1 (kPa)</label>
              <input type="number" value={poly_p1} onChange={(e) => setPoly_p1(e.target.value)} style={inputStyle} />
              <label style={inputLabelStyle}>V1 (m³)</label>
              <input type="number" value={poly_v1} onChange={(e) => setPoly_v1(e.target.value)} style={inputStyle} />
              <label style={inputLabelStyle}>P2 (kPa)</label>
              <input type="number" value={poly_p2} onChange={(e) => setPoly_p2(e.target.value)} style={inputStyle} />
              <label style={inputLabelStyle}>Polytropic Index (n)</label>
              <input type="number" value={poly_n} onChange={(e) => setPoly_n(e.target.value)} style={inputStyle} placeholder="1.2-1.4" />
            </>
          )}

          {module === 'isentropic' && (
            <>
              <label style={inputLabelStyle}>T1 (K)</label>
              <input type="number" value={isen_t1} onChange={(e) => setIsen_t1(e.target.value)} style={inputStyle} />
              <label style={inputLabelStyle}>P1 (kPa)</label>
              <input type="number" value={isen_p1} onChange={(e) => setIsen_p1(e.target.value)} style={inputStyle} />
              <label style={inputLabelStyle}>P2 (kPa)</label>
              <input type="number" value={isen_p2} onChange={(e) => setIsen_p2(e.target.value)} style={inputStyle} />
              <label style={inputLabelStyle}>Heat Capacity Ratio (k)</label>
              <input type="number" value={isen_k} onChange={(e) => setIsen_k(e.target.value)} style={inputStyle} placeholder="1.4 (air)" />
            </>
          )}

          {module === 'quality' && (
            <>
              <label style={inputLabelStyle}>Enthalpy h (kJ/kg)</label>
              <input type="number" value={steam_h} onChange={(e) => setSteam_h(e.target.value)} style={inputStyle} />
              <label style={inputLabelStyle}>Temperature (°C)</label>
              <input type="number" value={steam_temp} onChange={(e) => setSteam_temp(e.target.value)} style={inputStyle} placeholder="0.01 - 200" />
            </>
          )}

          {module === 'firstlaw' && (
            <>
              <label style={inputLabelStyle}>Mass m (kg)</label>
              <input type="number" value={energy_m} onChange={(e) => setEnergy_m(e.target.value)} style={inputStyle} />
              <label style={inputLabelStyle}>h1 - Initial Enthalpy (kJ/kg)</label>
              <input type="number" value={energy_h1} onChange={(e) => setEnergy_h1(e.target.value)} style={inputStyle} />
              <label style={inputLabelStyle}>h2 - Final Enthalpy (kJ/kg)</label>
              <input type="number" value={energy_h2} onChange={(e) => setEnergy_h2(e.target.value)} style={inputStyle} />
              <label style={inputLabelStyle}>Work W (kJ)</label>
              <input type="number" value={energy_w} onChange={(e) => setEnergy_w(e.target.value)} style={inputStyle} placeholder="0 for isobaric" />
            </>
          )}

          {module === 'efficiency' && (
            <>
              <label style={inputLabelStyle}>Actual Work W_actual (kJ)</label>
              <input type="number" value={eff_w_out} onChange={(e) => setEff_w_out(e.target.value)} style={inputStyle} />
              <label style={inputLabelStyle}>Ideal Work W_ideal (kJ)</label>
              <input type="number" value={eff_w_ideal} onChange={(e) => setEff_w_ideal(e.target.value)} style={inputStyle} />
              <label style={inputLabelStyle}>Heat Input Q_in (kJ)</label>
              <input type="number" value={eff_q_in} onChange={(e) => setEff_q_in(e.target.value)} style={inputStyle} />
            </>
          )}
        </div>

        {/* RIGHT: RESULTS */}
        <div style={cardStyle}>
          <div style={headerStyle}>Results</div>

          {error && <div style={errorStyle}>⚠ {error}</div>}

          {Object.keys(results).length > 0 && !error && (
            <div>
              {Object.entries(results).map(([key, value]) => (
                <div key={key} style={resultBoxStyle}>
                  <span style={{ color: '#6b7280', textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span style={{ color: '#6ee7b7', fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {Object.keys(results).length === 0 && !error && (
            <div style={{ color: '#4b5563', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
              ป้อนค่าเพื่อดูผลลัพธ์
            </div>
          )}
        </div>

      </div>
    </div>
  );
}