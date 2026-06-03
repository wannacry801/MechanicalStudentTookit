import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import * as math from "mathjs";

function GraphPlotter({ expression, variable = "t", domain = [0, 4] }) {
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
      <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: 12, fontStyle: "italic", background: "rgba(0,0,0,0.2)", borderRadius: 12, border: "1px solid #1f2937" }}>
        Cannot plot expression
      </div>
    );
  }

  const yVals = chartData.map(d => d.y).filter(v => v !== null);
  const yMin = yVals.length ? Math.min(...yVals) : -10;
  const yMax = yVals.length ? Math.max(...yVals) : 10;
  const yPad = (yMax - yMin) * 0.15 || 1;

  return (
    <div style={{ height: 160, width: "100%" }}>
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="x" stroke="#4b5563" fontSize={10} tickLine={false} tickCount={6} tickFormatter={v => v.toFixed(1)} />
            <YAxis stroke="#4b5563" fontSize={10} tickLine={false} domain={[yMin - yPad, yMax + yPad]} tickFormatter={v => v.toFixed(1)} />
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

function KinematicsDisplay({ label, labelColor, formula, latex }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.katex && formula) {
      try {
        window.katex.render(latex, ref.current, { throwOnError: false, displayMode: false });
      } catch {
        ref.current.textContent = formula;
      }
    } else if (ref.current && !formula) {
      ref.current.textContent = "—";
    }
  }, [latex, formula]);

  return (
    <div style={{ padding: "12px 14px", background: "rgba(0,0,0,0.4)", borderRadius: 12, border: "1px solid #1f2937", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 48 }}>
      <span style={{ color: labelColor, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", flexShrink: 0 }}>{label}</span>
      <span ref={ref} style={{ color: "#6ee7b7", textAlign: "right", fontSize: 14, overflowX: "auto" }} />
    </div>
  );
}

function diffExpression(expr) {
  const h = 1e-7;
  return `((${expr.replace(/t/g, `(t+${h})`)} ) - (${expr.replace(/t/g, `(t-${h})`)})) / ${2 * h}`;
}

function symbolicDiff(expr) {
  try {
    const node = math.parse(expr);
    const derivative = math.derivative(node, "t");
    return derivative.toString();
  } catch {
    return null;
  }
}

function symbolicIntegrate(expr) {
  const patterns = [
    [/^([+-]?\s*[\d.]+)\s*\*?\s*t\^([\d.]+)$/, (m) => `${parseFloat(m[1]) / (parseFloat(m[2]) + 1)} * t^${parseFloat(m[2]) + 1}`],
    [/^([+-]?\s*[\d.]+)\s*\*?\s*t$/, (m) => `${parseFloat(m[1]) / 2} * t^2`],
    [/^([+-]?\s*[\d.]+)$/, (m) => `${parseFloat(m[1])} * t`],
    [/^t\^([\d.]+)$/, (m) => `t^${parseFloat(m[1]) + 1} / ${parseFloat(m[1]) + 1}`],
    [/^t$/, () => `t^2 / 2`],
  ];
  const trimmed = expr.trim();
  for (const [re, fn] of patterns) {
    const m = trimmed.match(re);
    if (m) return fn(m);
  }
  return null;
}

function integrateByParts(expr) {
  const terms = splitTerms(expr);
  const integrated = terms.map(t => symbolicIntegrate(t.trim()));
  if (integrated.some(i => i === null)) return null;
  return integrated.join(" + ").replace(/\+\s*-/g, "- ");
}

function splitTerms(expr) {
  const terms = [];
  let depth = 0, current = "", i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (depth === 0 && (c === "+" || c === "-") && i > 0) {
      if (current.trim()) terms.push(current.trim());
      current = c;
      i++;
      continue;
    }
    current += c;
    i++;
  }
  if (current.trim()) terms.push(current.trim());
  return terms;
}

function exprToLatex(exprStr) {
  if (!exprStr) return "";
  try {
    return math.parse(exprStr).toTex({ parenthesis: "auto" });
  } catch {
    return exprStr;
  }
}

export default function DynamicsKinematics() {
  const [mode, setMode] = useState("s_to_va");
  const [inputExpr, setInputExpr] = useState("t^3 - 3*t^2 + 2*t");
  const [results, setResults] = useState({ pos: null, vel: null, acc: null, posLatex: "", velLatex: "", accLatex: "" });
  const [error, setError] = useState("");
  const [plotExpr, setPlotExpr] = useState("");
  const [plotMode, setPlotMode] = useState("vel");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";
    script.onload = () => {};
    document.head.appendChild(script);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!inputExpr.trim()) return;
    setError("");

    try {
      math.parse(inputExpr);
    } catch {
      setError("Invalid expression syntax");
      return;
    }

    try {
      if (mode === "s_to_va") {
        const sExpr = inputExpr;
        const vNode = math.derivative(math.parse(sExpr), "t");
        const vExpr = vNode.toString();
        const aNode = math.derivative(vNode, "t");
        const aExpr = aNode.toString();

        setResults({
          pos: sExpr, vel: vExpr, acc: aExpr,
          posLatex: `s = ${exprToLatex(sExpr)}`,
          velLatex: `v = \\frac{ds}{dt} = ${exprToLatex(vExpr)}`,
          accLatex: `a = \\frac{dv}{dt} = ${exprToLatex(aExpr)}`,
        });
        setPlotExpr(vExpr);
      } else {
        const aExpr = inputExpr;
        const vExpr = integrateByParts(aExpr);
        if (!vExpr) throw new Error("Cannot integrate symbolically — try a polynomial in t");
        const sExpr = integrateByParts(vExpr);
        if (!sExpr) throw new Error("Cannot integrate symbolically — try a polynomial in t");

        setResults({
          pos: sExpr, vel: vExpr, acc: aExpr,
          posLatex: `s = ${exprToLatex(sExpr)} + s_0`,
          velLatex: `v = ${exprToLatex(vExpr)} + v_0`,
          accLatex: `a = ${exprToLatex(aExpr)}`,
        });
        setPlotExpr(vExpr);
      }
    } catch (err) {
      setError(err.message || "Calculation error");
    }
  }, [inputExpr, mode]);

  useEffect(() => {
    if (!results) return;
    const map = { pos: results.pos, vel: results.vel, acc: results.acc };
    setPlotExpr(map[plotMode] || "");
  }, [plotMode, results]);

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
    { label: "π", value: "pi", type: "num" },
  ];

  const handleKeyPress = (val) => {
    if (val === "CLEAR") return setInputExpr("");
    if (val === "BACKSPACE") return setInputExpr(p => p.slice(0, -1));
    setInputExpr(p => p + val);
  };

  const btnStyle = (type) => ({
    height: 48, borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
    display: "flex", alignItems: "center", justifyContent: "center", transition: "opacity 0.1s",
    background: type === "action" ? "rgba(220,38,38,0.7)" : type === "var" ? "rgba(37,99,235,0.15)" : type === "op" ? "rgba(180,130,0,0.2)" : "#374151",
    color: type === "action" ? "#fff" : type === "var" ? "#60a5fa" : type === "op" ? "#fbbf24" : "#f3f4f6",
    border: type === "var" ? "1px solid rgba(59,130,246,0.2)" : "none",
  });

  const modeBtn = (m, label) => ({
    padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
    background: mode === m ? "#2563eb" : "transparent", color: mode === m ? "#fff" : "#6b7280", transition: "all 0.2s",
  });

  const plotBtn = (m, label) => ({
    padding: "4px 12px", borderRadius: 8, border: `1px solid ${plotMode === m ? "#38bdf8" : "#374151"}`,
    cursor: "pointer", fontSize: 11, fontWeight: 600, background: plotMode === m ? "rgba(56,189,248,0.1)" : "transparent",
    color: plotMode === m ? "#38bdf8" : "#6b7280",
  });

  const examples_s = ["t^3 - 3*t^2 + 2*t", "2*t^2 + 5*t", "sin(t)", "0.5*t^2"];
  const examples_a = ["6*t - 6", "9.81", "2*t + 3", "4"];

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, padding: 4, fontFamily: "monospace" }}>

      {/* LEFT */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 16, padding: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
          <div style={{ color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 12 }}>Hibbeler Ch.12 Solver</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, background: "#0d1117", padding: 6, borderRadius: 12, border: "1px solid #1f2937", marginBottom: 14 }}>
            <button style={modeBtn("s_to_va")} onClick={() => setMode("s_to_va")}>Given s(t)</button>
            <button style={modeBtn("a_to_vs")} onClick={() => setMode("a_to_vs")}>Given a(t)</button>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#6b7280", fontSize: 11, marginBottom: 6 }}>Input f(t):</div>
            <input
              value={inputExpr}
              onChange={e => setInputExpr(e.target.value)}
              style={{ width: "100%", background: "#0d1117", border: "1px solid #374151", borderRadius: 10, padding: "10px 14px", color: "#60a5fa", fontSize: 16, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {error && (
            <div style={{ padding: "8px 12px", background: "rgba(127,29,29,0.3)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 10, color: "#f87171", fontSize: 12, marginBottom: 10 }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ color: "#6b7280", fontSize: 10, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Examples ({mode === "s_to_va" ? "position" : "acceleration"}):</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(mode === "s_to_va" ? examples_s : examples_a).map(ex => (
              <button key={ex} onClick={() => setInputExpr(ex)} style={{ background: inputExpr === ex ? "#1e3a5f" : "#1f2937", border: `1px solid ${inputExpr === ex ? "#3b82f6" : "#374151"}`, color: inputExpr === ex ? "#60a5fa" : "#9ca3af", borderRadius: 8, padding: "3px 10px", cursor: "pointer", fontSize: 11, fontFamily: "monospace" }}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Keypad */}
        <div style={{ background: "rgba(31,41,55,0.6)", border: "1px solid #374151", borderRadius: 16, padding: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
            {keypadButtons.map((btn, i) => (
              <button key={i} onClick={() => handleKeyPress(btn.value)} style={btnStyle(btn.type)}>{btn.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 16, padding: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
          <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 700, borderBottom: "1px solid #1f2937", paddingBottom: 10, marginBottom: 14 }}>Kinematics Relations</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            <KinematicsDisplay label="Position s(t)" labelColor="#60a5fa" formula={results.pos} latex={results.posLatex} />
            <KinematicsDisplay label="Velocity v(t)" labelColor="#a78bfa" formula={results.vel} latex={results.velLatex} />
            <KinematicsDisplay label="Acceleration a(t)" labelColor="#fbbf24" formula={results.acc} latex={results.accLatex} />
          </div>

          {results.vel && !error && (
            <div style={{ borderTop: "1px solid #1f2937", paddingTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Graph:</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={plotBtn("pos", "s(t)")} onClick={() => setPlotMode("pos")}>s(t)</button>
                  <button style={plotBtn("vel", "v(t)")} onClick={() => setPlotMode("vel")}>v(t)</button>
                  <button style={plotBtn("acc", "a(t)")} onClick={() => setPlotMode("acc")}>a(t)</button>
                </div>
              </div>
              <GraphPlotter expression={plotExpr || ""} variable="t" domain={[0, 4]} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}