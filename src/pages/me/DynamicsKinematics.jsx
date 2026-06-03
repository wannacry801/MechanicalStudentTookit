import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import * as math from "mathjs";

function GraphPlotter({ expression, variable = "t", domain = [0, 4], title = "" }) {
  const chartData = [];
  const step = (domain[1] - domain[0]) / 300;
  let hasData = false;
  try {
    const compiled = math.compile(expression);
    for (let t = domain[0]; t <= domain[1]; t += step) {
      const scope = { [variable]: t };
      const y = compiled.evaluate(scope);
      if (typeof y === "number" && isFinite(y) && Math.abs(y) < 1e6) {
        chartData.push({ x: parseFloat(t.toFixed(4)), y: parseFloat(y.toFixed(6)) });
        hasData = true;
      } else {
        chartData.push({ x: parseFloat(t.toFixed(4)), y: null });
      }
    }
  } catch {
    return (
      <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: 12, fontStyle: "italic", background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid #1f2937" }}>
        Cannot plot expression
      </div>
    );
  }

  const yVals = chartData.map(d => d.y).filter(v => v !== null);
  const yMin = yVals.length ? Math.min(...yVals) : -10;
  const yMax = yVals.length ? Math.max(...yVals) : 10;
  const yPad = (yMax - yMin) * 0.15 || 1;

  return (
    <div style={{ height: 200, width: "100%" }}>
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="x" stroke="#4b5563" fontSize={10} tickLine={false} tickCount={6} tickFormatter={v => v.toFixed(2)} />
            <YAxis stroke="#4b5563" fontSize={10} tickLine={false} domain={[yMin - yPad, yMax + yPad]} tickFormatter={v => v.toFixed(2)} />
            <ReferenceLine y={0} stroke="#374151" strokeWidth={1} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8, fontSize: 11 }} labelStyle={{ color: "#9ca3af" }} itemStyle={{ color: "#38bdf8" }} formatter={v => [v?.toFixed(4), variable]} labelFormatter={v => `t = ${Number(v)?.toFixed(3)}`} connectNulls={false} />
            <Line type="monotone" dataKey="y" stroke="#38bdf8" strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: 12, fontStyle: "italic" }}>No data to plot</div>
      )}
    </div>
  );
}

function ResultBox({ label, value, latex, color = "#60a5fa" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.katex && latex) {
      try {
        window.katex.render(latex, ref.current, { throwOnError: false, displayMode: false });
      } catch {
        ref.current.textContent = value || "—";
      }
    } else if (ref.current) {
      ref.current.textContent = value || "—";
    }
  }, [latex, value]);

  return (
    <div style={{ padding: "12px", background: "rgba(0,0,0,0.4)", borderRadius: 10, border: "1px solid #1f2937", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 44 }}>
      <span style={{ color: color, fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", flexShrink: 0 }}>{label}</span>
      <span ref={ref} style={{ color: "#6ee7b7", textAlign: "right", fontSize: 13, overflowX: "auto", flex: 1 }} />
    </div>
  );
}

function exprToLatex(exprStr) {
  if (!exprStr) return "";
  try {
    return math.parse(exprStr).toTex({ parenthesis: "auto" });
  } catch {
    return exprStr;
  }
}

function findCriticalPoints(expr, domain = [0, 10]) {
  try {
    const compiled = math.compile(expr);
    const deriv = math.derivative(math.parse(expr), "t");
    const derivCompiled = math.compile(deriv);
    
    const criticalPoints = [];
    const step = (domain[1] - domain[0]) / 100;
    
    for (let t = domain[0]; t <= domain[1]; t += step) {
      const dv1 = derivCompiled.evaluate({ t: t - step });
      const dv2 = derivCompiled.evaluate({ t: t + step });
      if (dv1 * dv2 < 0) {
        criticalPoints.push(parseFloat(t.toFixed(3)));
      }
    }
    return criticalPoints;
  } catch {
    return [];
  }
}

function evaluateAt(expr, t) {
  try {
    const compiled = math.compile(expr);
    return compiled.evaluate({ t });
  } catch {
    return NaN;
  }
}

export default function AdvancedKinematics() {
  const [tab, setTab] = useState("rectilinear");
  const [mode, setMode] = useState("s_to_va");
  const [inputExpr, setInputExpr] = useState("t^3 - 3*t^2 + 2*t");
  const [v0, setV0] = useState("0");
  const [s0, setS0] = useState("0");
  const [timePoint, setTimePoint] = useState("1");
  const [g, setG] = useState("9.81");
  const [domain, setDomain] = useState("0:4");

  const [results, setResults] = useState({});
  const [error, setError] = useState("");
  const [plotExpr, setPlotExpr] = useState("");
  const [plotMode, setPlotMode] = useState("vel");
  const [motion, setMotion] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";
    document.head.appendChild(script);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
    document.head.appendChild(link);
  }, []);

  const calculateRectilinear = () => {
    if (!inputExpr.trim()) return;
    setError("");
    
    try {
      const [d1, d2] = domain.split(":").map(parseFloat);
      if (isNaN(d1) || isNaN(d2)) throw new Error("Invalid domain");

      if (mode === "s_to_va") {
        const sExpr = inputExpr;
        const vNode = math.derivative(math.parse(sExpr), "t");
        const vExpr = vNode.toString();
        const aNode = math.derivative(vNode, "t");
        const aExpr = aNode.toString();

        const t0 = parseFloat(timePoint);
        const sVal = evaluateAt(sExpr, t0);
        const vVal = evaluateAt(vExpr, t0);
        const aVal = evaluateAt(aExpr, t0);

        const criticalT = findCriticalPoints(vExpr, [d1, d2]);

        setResults({
          sExpr, vExpr, aExpr,
          sVal: isNaN(sVal) ? "—" : sVal.toFixed(4),
          vVal: isNaN(vVal) ? "—" : vVal.toFixed(4),
          aVal: isNaN(aVal) ? "—" : aVal.toFixed(4),
          sLatex: `s(${t0}) = ${exprToLatex(sVal.toFixed(4))}`,
          vLatex: `v(${t0}) = ${exprToLatex(vVal.toFixed(4))}`,
          aLatex: `a(${t0}) = ${exprToLatex(aVal.toFixed(4))}`,
          criticalT: criticalT.map(t => `t = ${t}s`).join(", ") || "None",
        });
        setPlotExpr(vExpr);
      } else {
        const aExpr = inputExpr;
        const v0Val = parseFloat(v0);
        const s0Val = parseFloat(s0);
        
        if (isNaN(v0Val) || isNaN(s0Val)) throw new Error("Invalid initial conditions");

        const vExpr = `${v0Val} + ${aExpr} * t`;
        const sExpr = `${s0Val} + ${v0Val} * t + 0.5 * (${aExpr}) * t^2`;

        const t0 = parseFloat(timePoint);
        const sVal = evaluateAt(sExpr, t0);
        const vVal = evaluateAt(vExpr, t0);
        const aVal = evaluateAt(aExpr, t0);

        setResults({
          sExpr, vExpr, aExpr,
          sVal: isNaN(sVal) ? "—" : sVal.toFixed(4),
          vVal: isNaN(vVal) ? "—" : vVal.toFixed(4),
          aVal: isNaN(aVal) ? "—" : aVal.toFixed(4),
          sLatex: `s(${t0}) = ${sVal.toFixed(4)}`,
          vLatex: `v(${t0}) = ${vVal.toFixed(4)}`,
          aLatex: `a = ${aVal.toFixed(4)}`,
          vAvg: ((sVal - s0Val) / t0).toFixed(4),
        });
        setPlotExpr(vExpr);
      }
    } catch (err) {
      setError(err.message || "Calculation error");
    }
  };

  const calculateFreeFall = () => {
    setError("");
    try {
      const gVal = parseFloat(g);
      const s0Val = parseFloat(s0);
      const v0Val = parseFloat(v0);
      const t0 = parseFloat(timePoint);

      if (isNaN(gVal) || isNaN(s0Val) || isNaN(v0Val) || isNaN(t0)) {
        throw new Error("Invalid input values");
      }

      const vExpr = `${v0Val} - ${gVal} * t`;
      const sExpr = `${s0Val} + ${v0Val} * t - 0.5 * ${gVal} * t^2`;

      const sVal = evaluateAt(sExpr, t0);
      const vVal = evaluateAt(vExpr, t0);

      setResults({
        vExpr, sExpr,
        sVal: sVal.toFixed(4),
        vVal: vVal.toFixed(4),
        sLatex: `s(${t0}) = ${sVal.toFixed(4)} m`,
        vLatex: `v(${t0}) = ${vVal.toFixed(4)} m/s`,
        eqofMotion: `s = ${s0Val} + ${v0Val}t - \\frac{1}{2}${gVal}t^2`,
      });
      setPlotExpr(sExpr);
    } catch (err) {
      setError(err.message || "Calculation error");
    }
  };

  const handleKeyPress = (val) => {
    if (val === "CLEAR") return setInputExpr("");
    if (val === "BACKSPACE") return setInputExpr(p => p.slice(0, -1));
    setInputExpr(p => p + val);
  };

  const keypadButtons = [
    { label: "t", value: "t", type: "var" },
    { label: "C", value: "CLEAR", type: "action" },
    { label: "⌫", value: "BACKSPACE", type: "action" },
    { label: "^", value: "^", type: "op" },
    { label: "/", value: "/", type: "op" },
    { label: "7", value: "7", type: "num" },
    { label: "8", value: "8", type: "num" },
    { label: "9", value: "9", type: "num" },
    { label: "*", value: "*", type: "op" },
    { label: "-", value: "-", type: "op" },
    { label: "4", value: "4", type: "num" },
    { label: "5", value: "5", type: "num" },
    { label: "6", value: "6", type: "num" },
    { label: "+", value: "+", type: "op" },
    { label: ".", value: ".", type: "num" },
    { label: "1", value: "1", type: "num" },
    { label: "2", value: "2", type: "num" },
    { label: "3", value: "3", type: "num" },
    { label: "0", value: "0", type: "num" },
  ];

  const btnStyle = (type) => ({
    height: 44, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
    display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.1s",
    background: type === "action" ? "rgba(220,38,38,0.7)" : type === "var" ? "rgba(37,99,235,0.15)" : type === "op" ? "rgba(180,130,0,0.2)" : "#374151",
    color: type === "action" ? "#fff" : type === "var" ? "#60a5fa" : type === "op" ? "#fbbf24" : "#f3f4f6",
    border: type === "var" ? "1px solid rgba(59,130,246,0.2)" : "none",
  });

  const tabBtn = (t, label) => ({
    padding: "8px 14px", borderRadius: 8, border: `1px solid ${tab === t ? "#3b82f6" : "#374151"}`,
    background: tab === t ? "rgba(59,130,246,0.2)" : "transparent", color: tab === t ? "#60a5fa" : "#9ca3af",
    cursor: "pointer", fontSize: 11, fontWeight: 600, transition: "all 0.2s",
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16, fontFamily: "monospace" }}>
      {/* Header */}
      <div style={{ marginBottom: 20, padding: 16, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: 12 }}>
        <h2 style={{ margin: "0 0 6px 0", color: "#e0e7ff", fontSize: 18, fontWeight: 700 }}>🚀 Hibbeler Ch.12 Complete Kinematics Suite</h2>
        <p style={{ margin: 0, color: "#9ca3af", fontSize: 12 }}>Rectilinear, Constant Acceleration, Free Fall, & Advanced Motion Analysis</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button style={tabBtn("rectilinear", "Rectilinear")} onClick={() => setTab("rectilinear")}>📍 Rectilinear Motion</button>
        <button style={tabBtn("constant", "Constant Accel")} onClick={() => setTab("constant")}>⏱️ Constant Acceleration</button>
        <button style={tabBtn("freefall", "Free Fall")} onClick={() => setTab("freefall")}>⬇️ Free Fall</button>
        <button style={tabBtn("analysis", "Analysis Tools")} onClick={() => setTab("analysis")}>📊 Analysis Tools</button>
      </div>

      {/* RECTILINEAR MOTION */}
      {tab === "rectilinear" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 16, padding: 16 }}>
            <h3 style={{ color: "#a78bfa", fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>Input Mode</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              <button onClick={() => setMode("s_to_va")} style={{ padding: "8px", borderRadius: 8, background: mode === "s_to_va" ? "#2563eb" : "#1f2937", color: mode === "s_to_va" ? "#fff" : "#9ca3af", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Given s(t)</button>
              <button onClick={() => setMode("a_to_vs")} style={{ padding: "8px", borderRadius: 8, background: mode === "a_to_vs" ? "#2563eb" : "#1f2937", color: mode === "a_to_vs" ? "#fff" : "#9ca3af", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Given a(t)</button>
            </div>

            <label style={{ color: "#9ca3af", fontSize: 11, display: "block", marginBottom: 4 }}>f(t):</label>
            <input value={inputExpr} onChange={e => setInputExpr(e.target.value)} style={{ width: "100%", background: "#0d1117", border: "1px solid #374151", borderRadius: 8, padding: "10px", color: "#60a5fa", fontSize: 14, marginBottom: 12, boxSizing: "border-box" }} />

            {mode === "a_to_vs" && (
              <>
                <label style={{ color: "#9ca3af", fontSize: 11, display: "block", marginBottom: 4 }}>v₀ (initial velocity):</label>
                <input value={v0} onChange={e => setV0(e.target.value)} style={{ width: "100%", background: "#0d1117", border: "1px solid #374151", borderRadius: 8, padding: "8px", color: "#60a5fa", fontSize: 12, marginBottom: 12, boxSizing: "border-box" }} />

                <label style={{ color: "#9ca3af", fontSize: 11, display: "block", marginBottom: 4 }}>s₀ (initial position):</label>
                <input value={s0} onChange={e => setS0(e.target.value)} style={{ width: "100%", background: "#0d1117", border: "1px solid #374151", borderRadius: 8, padding: "8px", color: "#60a5fa", fontSize: 12, marginBottom: 12, boxSizing: "border-box" }} />
              </>
            )}

            <label style={{ color: "#9ca3af", fontSize: 11, display: "block", marginBottom: 4 }}>Time t (for evaluation):</label>
            <input value={timePoint} onChange={e => setTimePoint(e.target.value)} style={{ width: "100%", background: "#0d1117", border: "1px solid #374151", borderRadius: 8, padding: "8px", color: "#60a5fa", fontSize: 12, marginBottom: 12, boxSizing: "border-box" }} />

            <label style={{ color: "#9ca3af", fontSize: 11, display: "block", marginBottom: 4 }}>Domain (min:max):</label>
            <input value={domain} onChange={e => setDomain(e.target.value)} style={{ width: "100%", background: "#0d1117", border: "1px solid #374151", borderRadius: 8, padding: "8px", color: "#60a5fa", fontSize: 12, marginBottom: 14, boxSizing: "border-box" }} />

            <button onClick={calculateRectilinear} style={{ width: "100%", padding: "10px", background: "#059669", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 12, marginBottom: 12 }}>▶ CALCULATE</button>

            {error && <div style={{ padding: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid #dc2626", borderRadius: 8, color: "#f87171", fontSize: 11 }}>⚠ {error}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, marginTop: 12 }}>
              {keypadButtons.map((btn, i) => (
                <button key={i} onClick={() => handleKeyPress(btn.value)} style={btnStyle(btn.type)}>{btn.label}</button>
              ))}
            </div>
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 16, padding: 16 }}>
            <h3 style={{ color: "#a78bfa", fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>Kinematics Results</h3>

            {results.sExpr && (
              <>
                <ResultBox label="Position s(t)" value={results.sVal} color="#60a5fa" />
                <ResultBox label="Velocity v(t)" value={results.vVal} color="#a78bfa" />
                <ResultBox label="Acceleration a(t)" value={results.aVal} color="#fbbf24" />
                
                {results.criticalT && (
                  <div style={{ padding: "10px", background: "rgba(0,0,0,0.3)", borderRadius: 8, marginTop: 10, color: "#6ee7b7", fontSize: 11 }}>
                    <strong>Turning Points:</strong> {results.criticalT}
                  </div>
                )}

                {results.vAvg && (
                  <div style={{ padding: "10px", background: "rgba(0,0,0,0.3)", borderRadius: 8, marginTop: 10, color: "#38bdf8", fontSize: 11 }}>
                    <strong>Avg Velocity:</strong> {results.vAvg} m/s
                  </div>
                )}

                <div style={{ marginTop: 14, padding: 12, background: "rgba(0,0,0,0.3)", borderRadius: 8 }}>
                  <p style={{ color: "#9ca3af", fontSize: 10, margin: "0 0 6px 0" }}>Functions:</p>
                  <p style={{ color: "#6ee7b7", fontSize: 11, margin: "2px 0", fontFamily: "monospace" }}>s = {results.sExpr}</p>
                  <p style={{ color: "#6ee7b7", fontSize: 11, margin: "2px 0", fontFamily: "monospace" }}>v = {results.vExpr}</p>
                  <p style={{ color: "#6ee7b7", fontSize: 11, margin: "2px 0", fontFamily: "monospace" }}>a = {results.aExpr}</p>
                </div>

                <div style={{ marginTop: 14 }}>
                  <GraphPlotter expression={plotExpr || ""} variable="t" domain={domain.split(":").map(parseFloat)} title="Velocity Graph" />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CONSTANT ACCELERATION */}
      {tab === "constant" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 16, padding: 16 }}>
            <h3 style={{ color: "#fbbf24", fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>Constant Acceleration Equations</h3>

            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <label style={{ color: "#9ca3af", fontSize: 11, display: "block", marginBottom: 4 }}>Acceleration a (m/s²):</label>
                <input value={inputExpr} onChange={e => setInputExpr(e.target.value)} style={{ width: "100%", background: "#0d1117", border: "1px solid #374151", borderRadius: 8, padding: "8px", color: "#60a5fa", fontSize: 12, boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ color: "#9ca3af", fontSize: 11, display: "block", marginBottom: 4 }}>v₀ (m/s):</label>
                <input value={v0} onChange={e => setV0(e.target.value)} style={{ width: "100%", background: "#0d1117", border: "1px solid #374151", borderRadius: 8, padding: "8px", color: "#60a5fa", fontSize: 12, boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ color: "#9ca3af", fontSize: 11, display: "block", marginBottom: 4 }}>s₀ (m):</label>
                <input value={s0} onChange={e => setS0(e.target.value)} style={{ width: "100%", background: "#0d1117", border: "1px solid #374151", borderRadius: 8, padding: "8px", color: "#60a5fa", fontSize: 12, boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ color: "#9ca3af", fontSize: 11, display: "block", marginBottom: 4 }}>Time t (s):</label>
                <input value={timePoint} onChange={e => setTimePoint(e.target.value)} style={{ width: "100%", background: "#0d1117", border: "1px solid #374151", borderRadius: 8, padding: "8px", color: "#60a5fa", fontSize: 12, boxSizing: "border-box" }} />
              </div>

              <button onClick={calculateRectilinear} style={{ width: "100%", padding: "10px", background: "#d97706", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>▶ SOLVE</button>
            </div>

            {results.vExpr && (
              <div style={{ marginTop: 14, padding: 12, background: "rgba(217,119,6,0.1)", borderRadius: 8, border: "1px solid rgba(217,119,6,0.3)" }}>
                <p style={{ color: "#fbbf24", fontSize: 11, margin: "0 0 6px 0", fontWeight: 700 }}>Key Equations:</p>
                <p style={{ color: "#fed7aa", fontSize: 10, margin: "3px 0", fontFamily: "monospace" }}>v = v₀ + at</p>
                <p style={{ color: "#fed7aa", fontSize: 10, margin: "3px 0", fontFamily: "monospace" }}>s = s₀ + v₀t + ½at²</p>
                <p style={{ color: "#fed7aa", fontSize: 10, margin: "3px 0", fontFamily: "monospace" }}>v² = v₀² + 2a(s - s₀)</p>
              </div>
            )}
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 16, padding: 16 }}>
            <h3 style={{ color: "#fbbf24", fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>Results</h3>

            {results.sVal && (
              <>
                <ResultBox label="Position s(t)" value={results.sVal} color="#fbbf24" />
                <ResultBox label="Velocity v(t)" value={results.vVal} color="#fed7aa" />
                <ResultBox label="Avg Velocity" value={results.vAvg} color="#fcd34d" />

                {results.sExpr && (
                  <div style={{ marginTop: 14 }}>
                    <GraphPlotter expression={results.sExpr} variable="t" domain={[0, parseFloat(timePoint) * 1.5]} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* FREE FALL */}
      {tab === "freefall" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 16, padding: 16 }}>
            <h3 style={{ color: "#ef4444", fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>Free Fall Parameters</h3>

            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <label style={{ color: "#9ca3af", fontSize: 11, display: "block", marginBottom: 4 }}>g (m/s²):</label>
                <input value={g} onChange={e => setG(e.target.value)} style={{ width: "100%", background: "#0d1117", border: "1px solid #374151", borderRadius: 8, padding: "8px", color: "#60a5fa", fontSize: 12, boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ color: "#9ca3af", fontSize: 11, display: "block", marginBottom: 4 }}>h₀ (initial height, m):</label>
                <input value={s0} onChange={e => setS0(e.target.value)} style={{ width: "100%", background: "#0d1117", border: "1px solid #374151", borderRadius: 8, padding: "8px", color: "#60a5fa", fontSize: 12, boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ color: "#9ca3af", fontSize: 11, display: "block", marginBottom: 4 }}>v₀ (initial velocity, m/s):</label>
                <input value={v0} onChange={e => setV0(e.target.value)} style={{ width: "100%", background: "#0d1117", border: "1px solid #374151", borderRadius: 8, padding: "8px", color: "#60a5fa", fontSize: 12, boxSizing: "border-box" }} />
              </div>

              <div>
                <label style={{ color: "#9ca3af", fontSize: 11, display: "block", marginBottom: 4 }}>Time t (s):</label>
                <input value={timePoint} onChange={e => setTimePoint(e.target.value)} style={{ width: "100%", background: "#0d1117", border: "1px solid #374151", borderRadius: 8, padding: "8px", color: "#60a5fa", fontSize: 12, boxSizing: "border-box" }} />
              </div>

              <button onClick={calculateFreeFall} style={{ width: "100%", padding: "10px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 12 }}>▶ DROP</button>
            </div>

            {error && <div style={{ padding: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid #dc2626", borderRadius: 8, color: "#f87171", fontSize: 11, marginTop: 10 }}>⚠ {error}</div>}

            {results.eqofMotion && (
              <div style={{ marginTop: 14, padding: 12, background: "rgba(239,68,68,0.1)", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)" }}>
                <p style={{ color: "#f87171", fontSize: 11, margin: "0 0 6px 0", fontWeight: 700 }}>Equation of Motion:</p>
                <p style={{ color: "#fca5a5", fontSize: 10, margin: "0", fontFamily: "monospace" }}>y = {results.eqofMotion}</p>
              </div>
            )}
          </div>

          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 16, padding: 16 }}>
            <h3 style={{ color: "#ef4444", fontSize: 13, fontWeight: 700, marginBottom: 12, textTransform: "uppercase" }}>Free Fall Results</h3>

            {results.sVal && (
              <>
                <ResultBox label="Height h(t)" value={results.sVal} color="#ef4444" />
                <ResultBox label="Velocity v(t)" value={results.vVal} color="#f87171" />

                {results.sExpr && (
                  <div style={{ marginTop: 14 }}>
                    <GraphPlotter expression={results.sExpr} variable="t" domain={[0, parseFloat(timePoint) * 1.2]} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* INFO FOOTER */}
      <div style={{ marginTop: 20, padding: 12, background: "rgba(31,41,55,0.6)", border: "1px solid #1f2937", borderRadius: 12, color: "#9ca3af", fontSize: 11 }}>
        <p style={{ margin: 0 }}><strong>📚 Hibbeler Ch.12 Topics:</strong> Rectilinear Motion (s, v, a) • Constant Acceleration (v = v₀ + at, s = s₀ + v₀t + ½at²) • Free Fall (h = h₀ + v₀t - ½gt²) • Critical Points & Turning Moments • Graphical Analysis</p>
      </div>
    </div>
  );
}
