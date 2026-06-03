import React, { useState, useRef, useCallback } from 'react';

function MathDisplay({ formula }) {
  const ref = useRef(null);
  React.useEffect(() => {
    if (ref.current && window.katex) {
      try {
        window.katex.render(formula, ref.current, { displayMode: true, throwOnError: false });
      } catch {
        if (ref.current) ref.current.textContent = formula;
      }
    }
  }, [formula]);
  return <span ref={ref} />;
}

async function callClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || '').join('') ?? '';
}

export default function Differentiation() {
  const [expression, setExpression] = useState('log(x)+x^2');
  const [variable, setVariable] = useState('x');
  const [result, setResult] = useState('');
  const [displayFormula, setDisplayFormula] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const compute = useCallback(async () => {
    if (!expression.trim()) return;
    setLoading(true);
    setError('');
    setResult('');

    try {
      const prompt = `Differentiate f(${variable}) = ${expression} with respect to ${variable}.
Return ONLY a valid LaTeX expression for the derivative. No explanation, no text, no markdown fences, no preamble.
Example input: x^2 + sin(x)
Example output: 2x + \\cos(x)`;

      const raw = await callClaude(prompt);
      const tex = raw.replace(/```[a-z]*/g, '').replace(/```/g, '').trim();
      setDisplayFormula(`\\frac{d}{d${variable}}\\left[${expression.replace(/\*/g, '\\cdot ')}\\right] = ${tex}`);
      setResult(tex);
    } catch {
      setError('Invalid expression');
    }
    setLoading(false);
  }, [expression, variable]);

  const handleKeyPress = (value) => {
    if (value === 'CLEAR') return setExpression('');
    if (value === 'BACKSPACE') return setExpression(prev => prev.slice(0, -1));
    setExpression(prev => prev + value);
  };

  const keypadButtons = [
    { label: 'x', value: 'x', type: 'var' },
    { label: 'y', value: 'y', type: 'var' },
    { label: 't', value: 't', type: 'var' },
    { label: 'C', value: 'CLEAR', type: 'action' },
    { label: '⌫', value: 'BACKSPACE', type: 'action' },
    { label: 'ln', value: 'log(', type: 'func' },
    { label: 'log₁₀', value: 'logbase(', type: 'func' },
    { label: 'sin', value: 'sin(', type: 'func' },
    { label: 'cos', value: 'cos(', type: 'func' },
    { label: '^', value: '^', type: 'op' },
    { label: '7', value: '7', type: 'num' },
    { label: '8', value: '8', type: 'num' },
    { label: '9', value: '9', type: 'num' },
    { label: '(', value: '(', type: 'op' },
    { label: ')', value: ')', type: 'op' },
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
  ];

  const getBtnClass = (type) => {
    const base = "h-14 rounded-xl font-medium text-lg active:scale-95 transition flex items-center justify-center ";
    if (type === 'action') return base + "bg-red-600/80 text-white";
    if (type === 'var') return base + "bg-blue-600/20 text-blue-400 border border-blue-500/20";
    if (type === 'func') return base + "bg-purple-600/20 text-purple-400";
    if (type === 'op') return base + "bg-amber-600/20 text-amber-400 font-bold";
    return base + "bg-gray-700 text-gray-100";
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" async />

      <div className="max-w-5xl mx-auto flex flex-col space-y-4">
        <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Diff Variable:</span>
            <input
              type="text"
              value={variable}
              onChange={(e) => setVariable(e.target.value)}
              className="w-10 bg-gray-800 border border-gray-700 rounded text-center text-sm p-1 text-blue-400"
            />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            className="w-full bg-transparent text-2xl font-mono text-gray-100 focus:outline-none border-b border-gray-800 pb-2"
          />

          {/* Compute button */}
          <button
            onClick={compute}
            disabled={loading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 active:scale-95 transition text-white font-bold rounded-xl"
          >
            {loading ? 'Computing...' : 'DIFFERENTIATE'}
          </button>

          <div className="min-h-[80px] bg-gray-950/60 rounded-xl p-4 flex items-center justify-center overflow-x-auto">
            {error
              ? <span className="text-sm text-red-400 font-mono">{error}</span>
              : displayFormula
              ? <div className="text-xl text-emerald-400"><MathDisplay formula={displayFormula} /></div>
              : <span className="text-sm text-gray-600 italic">Waiting...</span>
            }
          </div>
        </div>

        <div className="p-4 bg-gray-800/60 rounded-2xl border border-gray-700">
          <div className="grid grid-cols-5 gap-2.5">
            {keypadButtons.map((btn, index) => (
              <button key={index} onClick={() => handleKeyPress(btn.value)} className={getBtnClass(btn.type)}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}