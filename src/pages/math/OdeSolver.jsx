import React, { useState, useEffect, useRef } from 'react';

// Self-contained KaTeX renderer (no external import needed)
function MathDisplay({ formula }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.katex) {
      try {
        window.katex.render(formula, ref.current, { displayMode: true, throwOnError: false });
      } catch (e) {
        ref.current.textContent = formula;
      }
    }
  }, [formula]);
  return <span ref={ref} />;
}

export default function OdeSolver() {
  const [coeffA, setCoeffA] = useState('1');
  const [coeffB, setCoeffB] = useState('2');
  const [coeffC, setCoeffC] = useState('1');
  const [gOfT, setGOfT] = useState('cos(t)');

  const [result, setResult] = useState('');
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!coeffA || !coeffB || !coeffC) {
      setResult('');
      setSteps([]);
      return;
    }

    try {
      const a = parseFloat(coeffA);
      const b = parseFloat(coeffB);
      const c = parseFloat(coeffC);

      if (isNaN(a) || isNaN(b) || isNaN(c)) {
        setError('Coefficients must be numeric');
        return;
      }
      if (a === 0) {
        setError('Coefficient [a] cannot be zero (must be 2nd order)');
        return;
      }

      const cleanG = gOfT.trim() === '' ? '0' : gOfT.trim();

      // ─── Characteristic equation roots ───────────────────────────────────
      const disc = b * b - 4 * a * c;
      let ycTeX = '';
      let stepsArr = [];

      stepsArr.push(`\\text{Characteristic equation: } ${a}r^2 + ${b}r + ${c} = 0`);
      stepsArr.push(`\\Delta = b^2 - 4ac = ${b}^2 - 4(${a})(${c}) = ${disc}`);

      const fmt = (n) => {
        const r = Math.round(n * 1000) / 1000;
        return r < 0 ? `(${r})` : `${r}`;
      };

      if (disc > 0) {
        const r1 = (-b + Math.sqrt(disc)) / (2 * a);
        const r2 = (-b - Math.sqrt(disc)) / (2 * a);
        stepsArr.push(`\\text{Two distinct real roots: } r_1 = ${fmt(r1)},\\; r_2 = ${fmt(r2)}`);
        ycTeX = `C_1 e^{${fmt(r1)}t} + C_2 e^{${fmt(r2)}t}`;
      } else if (disc === 0) {
        const r = -b / (2 * a);
        stepsArr.push(`\\text{Repeated real root: } r = ${fmt(r)}`);
        ycTeX = `(C_1 + C_2 t)e^{${fmt(r)}t}`;
      } else {
        const alpha = -b / (2 * a);
        const beta = Math.sqrt(-disc) / (2 * a);
        stepsArr.push(`\\text{Complex roots: } r = ${fmt(alpha)} \\pm ${fmt(beta)}i`);
        ycTeX = `e^{${fmt(alpha)}t}\\!\\left(C_1\\cos(${fmt(beta)}t) + C_2\\sin(${fmt(beta)}t)\\right)`;
      }

      // ─── Particular solution (Method of Undetermined Coefficients) ────────
      let ypTeX = '';

      if (cleanG === '0') {
        setResult(`y(t) = ${ycTeX}`);
        setSteps(stepsArr);
        setError('');
        return;
      }

      // Pattern matching for common g(t) forms
      const g = cleanG;

      // cos(ωt) or sin(ωt)
      const trigMatch = g.match(/^([\d.]*)\s*\*?\s*(sin|cos)\(([^)]*)\)$/);
      // exp(αt)  or  e^(αt)
      const expMatch = g.match(/^([\d.]*)\s*\*?\s*(?:exp\(([^)]*)\)|e\^\(([^)]*)\)|e\^([^()\s*+\-]+))$/);
      // polynomial: just t^n or numbers
      const polyMatch = !trigMatch && !expMatch && /^[\d\s\*\+\-\.t\^]+$/.test(g);
      // A*exp(αt)*cos/sin
      const expTrigMatch = g.match(/^([\d.]*)\s*\*?\s*(?:exp\(([^)]*)\)|e\^\(([^)]*)\))\s*\*\s*(sin|cos)\(([^)]*)\)$/);

      if (expTrigMatch) {
        const amp = expTrigMatch[1] || '1';
        const alpha2 = expTrigMatch[2] || expTrigMatch[3] || '0';
        const fn = expTrigMatch[4];
        const omega = expTrigMatch[5];
        ypTeX = `e^{${alpha2}t}\\!(A\\cos(${omega}t) + B\\sin(${omega}t))`;
        stepsArr.push(`\\text{Assume } y_p = ${ypTeX} \\text{ (undetermined coefficients)}`);
      } else if (trigMatch) {
        const amp = trigMatch[1] || '1';
        const fn = trigMatch[2];
        const omega = trigMatch[3] || 't';
        // Check for resonance: if omega matches natural frequency beta
        const omegaVal = parseFloat(omega) || 1;
        const beta = disc < 0 ? Math.sqrt(-disc) / (2 * a) : null;
        if (beta && Math.abs(omegaVal - beta) < 1e-9 && b === 0) {
          ypTeX = `t(A\\cos(${omega}t) + B\\sin(${omega}t))`;
          stepsArr.push(`\\text{Resonance detected — assume } y_p = ${ypTeX}`);
        } else {
          ypTeX = `A\\cos(${omega}t) + B\\sin(${omega}t)`;
          stepsArr.push(`\\text{Assume } y_p = ${ypTeX}`);

          // Solve for A and B analytically
          const w = omegaVal;
          // yp = A cos(wt) + B sin(wt)
          // yp'' = -w²A cos - w²B sin
          // a*yp'' + b*yp' + c*yp = (c - a*w²)A cos + (c - a*w²)B sin + b*w(-A sin + B cos)
          // = [(c-a*w²)A + b*w*B] cos + [-(b*w)A + (c-a*w²)B] sin = amplitude*(cos or sin)
          const coeff_cos = parseFloat(amp) * (fn === 'cos' ? 1 : 0);
          const coeff_sin = parseFloat(amp) * (fn === 'sin' ? 1 : 0);
          const p = c - a * w * w;
          const q = b * w;
          const det = p * p + q * q;
          if (Math.abs(det) > 1e-12) {
            const A = (p * coeff_cos + q * coeff_sin) / det;
            const B = (-q * coeff_cos + p * coeff_sin) / det;
            ypTeX = `${Math.round(A * 1000) / 1000}\\cos(${omega}t) + ${Math.round(B * 1000) / 1000}\\sin(${omega}t)`;
            stepsArr.push(`\\text{Solving: } A = \\frac{${Math.round(p * coeff_cos * 1000) / 1000} + ${Math.round(q * coeff_sin * 1000) / 1000}}{${Math.round(det * 1000) / 1000}} = ${Math.round(A * 1000) / 1000}`);
            stepsArr.push(`B = ${Math.round(B * 1000) / 1000}`);
          }
        }
      } else if (expMatch) {
        const alphaStr = expMatch[2] || expMatch[3] || expMatch[4] || '1';
        const alphaVal = parseFloat(alphaStr) || 1;
        // Check if e^(αt) is a solution to homogeneous (resonance)
        const charVal = a * alphaVal * alphaVal + b * alphaVal + c;
        if (Math.abs(charVal) < 1e-9) {
          ypTeX = `Ate^{${alphaStr}t}`;
          stepsArr.push(`\\text{Resonance: } e^{${alphaStr}t} \\text{ solves homogeneous — assume } y_p = ${ypTeX}`);
        } else {
          const A = (parseFloat(g.match(/^[\d.]*/)?.[0]) || 1) / charVal;
          ypTeX = `${Math.round(A * 1000) / 1000}e^{${alphaStr}t}`;
          stepsArr.push(`\\text{Assume } y_p = Ae^{${alphaStr}t},\\; A = \\frac{1}{${Math.round(charVal * 1000) / 1000}} = ${Math.round(A * 1000) / 1000}`);
        }
      } else if (polyMatch) {
        // Degree of polynomial in g
        const tPow = [...g.matchAll(/t\^?(\d*)/g)];
        let degree = 0;
        if (tPow.length > 0) {
          degree = Math.max(...tPow.map(m => parseInt(m[1] || '1') || 1));
        }
        ypTeX = degree === 0 ? 'A' : degree === 1 ? 'At + B' : degree === 2 ? 'At^2 + Bt + C' : `A_${degree}t^${degree} + \\cdots + A_0`;
        stepsArr.push(`\\text{Polynomial forcing — assume } y_p = ${ypTeX}`);
      } else {
        // Fallback: show form only
        ypTeX = 'y_p(t) \\text{ (use variation of parameters)}';
        stepsArr.push(`\\text{General g(t) — use variation of parameters or Laplace transform}`);
      }

      setResult(`y(t) = ${ycTeX} + ${ypTeX}`);
      setSteps(stepsArr);
      setError('');
    } catch (err) {
      setError('ODE Solver Error: check coefficient expressions');
      setResult('');
      setSteps([]);
    }
  }, [coeffA, coeffB, coeffC, gOfT]);

  const handleKeyPress = (value) => {
    if (value === 'CLEAR') return setGOfT('');
    if (value === 'BACKSPACE') return setGOfT(prev => prev.slice(0, -1));
    setGOfT(prev => prev + value);
  };

  const keypadButtons = [
    { label: 't', value: 't', type: 'var' },
    { label: 'C', value: 'CLEAR', type: 'action' },
    { label: '⌫', value: 'BACKSPACE', type: 'action' },
    { label: 'sin', value: 'sin(', type: 'func' },
    { label: 'cos', value: 'cos(', type: 'func' },
    { label: '7', value: '7', type: 'num' },
    { label: '8', value: '8', type: 'num' },
    { label: '9', value: '9', type: 'num' },
    { label: 'eᵗ', value: 'exp(', type: 'func' },
    { label: '^', value: '^', type: 'op' },
    { label: '4', value: '4', type: 'num' },
    { label: '5', value: '5', type: 'num' },
    { label: '6', value: '6', type: 'num' },
    { label: '*', value: '*', type: 'op' },
    { label: '/', value: '/', type: 'op' },
    { label: '1', value: '1', type: 'num' },
    { label: '2', value: '2', type: 'num' },
    { label: '3', value: '3', type: 'num' },
    { label: '+', value: '+', type: 'op' },
    { label: '-', value: '-', type: 'op' },
    { label: '0', value: '0', type: 'num' },
    { label: '.', value: '.', type: 'num' },
    { label: 'π', value: 'pi', type: 'num' },
    { label: '(', value: '(', type: 'op' },
    { label: ')', value: ')', type: 'op' },
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col space-y-4">
      {/* KaTeX CDN */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" async />

      {/* Header */}
      <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          2nd Order Linear ODE — ay″ + by′ + cy = g(t)
        </h3>

        {/* Coefficient inputs */}
        <div className="grid grid-cols-4 gap-3 bg-gray-950/50 p-4 rounded-xl items-center text-center">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Coefficient [a]</label>
            <input
              type="number"
              value={coeffA}
              onChange={(e) => setCoeffA(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-center text-blue-400 font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Coefficient [b]</label>
            <input
              type="number"
              value={coeffB}
              onChange={(e) => setCoeffB(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-center text-purple-400 font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Coefficient [c]</label>
            <input
              type="number"
              value={coeffC}
              onChange={(e) => setCoeffC(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-center text-amber-400 font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Function g(t)</label>
            <input
              ref={inputRef}
              type="text"
              value={gOfT}
              onChange={(e) => setGOfT(e.target.value)}
              placeholder="0 or f(t)"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-center text-gray-100 font-mono"
            />
          </div>
        </div>

        {/* Solution display */}
        <div className="min-h-[90px] bg-gray-950/80 rounded-xl p-4 flex items-center justify-center overflow-x-auto">
          {error ? (
            <span className="text-sm text-red-400 font-mono">{error}</span>
          ) : result ? (
            <div className="text-xl text-emerald-400">
              <MathDisplay formula={result} />
            </div>
          ) : (
            <span className="text-sm text-gray-600">Waiting for valid inputs...</span>
          )}
        </div>

        {/* Steps */}
        {steps.length > 0 && (
          <details className="bg-gray-950/40 rounded-xl p-3">
            <summary className="text-xs text-gray-500 cursor-pointer select-none uppercase tracking-wider">
              Solution Steps
            </summary>
            <div className="mt-3 space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="text-sm text-gray-300 overflow-x-auto">
                  <MathDisplay formula={step} />
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Keypad */}
      <div className="p-4 bg-gray-800/60 rounded-2xl border border-gray-700">
        <div className="grid grid-cols-5 gap-2">
          {keypadButtons.map((btn, index) => (
            <button
              key={index}
              onClick={() => handleKeyPress(btn.value)}
              className={`h-12 rounded-xl font-medium text-md active:scale-95 transition flex items-center justify-center ${
                btn.type === 'action'
                  ? 'bg-red-600/80 text-white'
                  : btn.type === 'var'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                  : btn.type === 'func'
                  ? 'bg-purple-600/20 text-purple-400'
                  : btn.type === 'op'
                  ? 'bg-amber-600/20 text-amber-400 font-bold'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
