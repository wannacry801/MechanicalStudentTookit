import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import * as math from "mathjs";

export default function GraphPlotter() {
  const [expression, setExpression] = useState("sin(x)");
  const [input, setInput] = useState("sin(x)");
  const [domainMin, setDomainMin] = useState(-10);
  const [domainMax, setDomainMax] = useState(10);
  const [error, setError] = useState("");

  const chartData = useMemo(() => {
    const data = [];
    const step = (domainMax - domainMin) / 300;

    try {
      const compiled = math.compile(expression);
      setError("");

      for (let x = domainMin; x <= domainMax; x += step) {
        const y = compiled.evaluate({ x });
        if (typeof y === "number" && !isNaN(y) && isFinite(y) && Math.abs(y) < 1e6) {
          data.push({ x: parseFloat(x.toFixed(4)), y: parseFloat(y.toFixed(6)) });
        } else {
          data.push({ x: parseFloat(x.toFixed(4)), y: null });
        }
      }
    } catch (e) {
      setError(e.message);
      return [];
    }

    return data;
  }, [expression, domainMin, domainMax]);

  const yValues = chartData.map((d) => d.y).filter((v) => v !== null);
  const yMin = yValues.length ? Math.min(...yValues) : -10;
  const yMax = yValues.length ? Math.max(...yValues) : 10;
  const yPad = (yMax - yMin) * 0.1 || 1;

  const handlePlot = () => {
    setExpression(input.trim());
  };

  const examples = ["sin(x)", "x^2", "cos(x) * x", "tan(x)", "log(x)", "sqrt(abs(x))"];

  return (
    <div style={{ background: "#0d1117", minHeight: "100vh", padding: "24px", fontFamily: "monospace" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: "#e2e8f0", fontSize: 20, fontWeight: 700, margin: 0 }}>
            📈 Graph Plotter
          </h1>
          <p style={{ color: "#4a5568", fontSize: 12, margin: "4px 0 0" }}>
            Plot mathematical functions using mathjs syntax
          </p>
        </div>

        {/* Input */}
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <label style={{ color: "#8b949e", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 6 }}>
            f(x) =
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePlot()}
              placeholder="e.g. sin(x) + x^2 / 4"
              style={{
                flex: 1,
                background: "#0d1117",
                border: "1px solid #30363d",
                borderRadius: 6,
                padding: "8px 12px",
                color: "#58a6ff",
                fontSize: 15,
                outline: "none",
              }}
            />
            <button
              onClick={handlePlot}
              style={{
                background: "#238636",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 18px",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Plot
            </button>
          </div>

          {/* Domain */}
          <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center" }}>
            <span style={{ color: "#8b949e", fontSize: 11 }}>x range:</span>
            <input
              type="number"
              value={domainMin}
              onChange={(e) => setDomainMin(Number(e.target.value))}
              style={{ width: 64, background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, padding: "4px 8px", color: "#e2e8f0", fontSize: 12, outline: "none" }}
            />
            <span style={{ color: "#4a5568" }}>to</span>
            <input
              type="number"
              value={domainMax}
              onChange={(e) => setDomainMax(Number(e.target.value))}
              style={{ width: 64, background: "#0d1117", border: "1px solid #30363d", borderRadius: 6, padding: "4px 8px", color: "#e2e8f0", fontSize: 12, outline: "none" }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginTop: 10, color: "#f85149", fontSize: 12, background: "#2d0a0a", border: "1px solid #5a1a1a", borderRadius: 6, padding: "6px 10px" }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {/* Chart */}
        <div style={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ color: "#8b949e", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            f(x) = {expression}
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis
                  dataKey="x"
                  stroke="#4a5568"
                  fontSize={10}
                  tickLine={false}
                  tickCount={9}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <YAxis
                  stroke="#4a5568"
                  fontSize={10}
                  tickLine={false}
                  domain={[yMin - yPad, yMax + yPad]}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <ReferenceLine y={0} stroke="#30363d" strokeWidth={1} />
                <ReferenceLine x={0} stroke="#30363d" strokeWidth={1} />
                <Tooltip
                  contentStyle={{ background: "#161b22", border: "1px solid #30363d", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#9ece6a" }}
                  itemStyle={{ color: "#58a6ff" }}
                  formatter={(v) => [v?.toFixed(4), "y"]}
                  labelFormatter={(v) => `x = ${Number(v)?.toFixed(4)}`}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: "#38bdf8" }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "#4a5568", fontSize: 13 }}>
              Enter a valid expression and click Plot
            </div>
          )}
        </div>

        {/* Examples */}
        <div>
          <div style={{ color: "#8b949e", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Quick examples
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => { setInput(ex); setExpression(ex); }}
                style={{
                  background: expression === ex ? "#1f3a5f" : "#161b22",
                  border: `1px solid ${expression === ex ? "#58a6ff" : "#30363d"}`,
                  color: expression === ex ? "#58a6ff" : "#8b949e",
                  borderRadius: 6,
                  padding: "4px 12px",
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "monospace",
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}