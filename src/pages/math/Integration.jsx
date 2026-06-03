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

export default function Integration() {
  const [expression, setExpression] = useState('log(x)');
  const [variable, setVariable] = useState('x');
  const [isDefinite, setIsDefinite] = useState(false);
  const [lowerBound, setLowerBound] = useState('1');
  const [upperBound, setUpperBound] = useState('3');
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
      let prompt;
      if (!isDefinite) {
        prompt = `Compute the indefinite integral of f(${variable}) = ${expression} with respect to ${variable}.
Return ONLY a valid LaTeX expression for the result (including + C). No explanation, no text, no markdown fences. Example output: \\frac{x^2}{2} + C`;
        const raw = await callClaude(prompt);
        const tex = raw.replace(/```[a-z]*/g, '').replace(/```/g, '').trim();
        setDisplayFormula(`\\int \\left(${expression.replace(/\*/g, '\\cdot ')}\\right)\\,d${variable} = ${tex}`);
        setResult(tex);
      } else {
        if (!lowerBound || !upperBound) { setError('Specify Bounds'); setLoading(false); return; }
        prompt = `Compute the definite integral of f(${variable}) = ${expression} from ${variable}=${lowerBound} to ${variable}=${upperBound}.
Return ONLY a valid LaTeX expression showing the exact value and its decimal approximation, formatted as: <exact> \\approx <decimal>.
No explanation, no text, no markdown fences. Example: \\ln(3) \\approx 1.0986`;
        const raw = await callClaude(prompt);
        const tex = raw.replace(/```[a-z]*/g, '').replace(/```/g, '').trim();
        setDisplayFormula(`\\int_{${lowerBound}}^{${upperBound}} \\left(${expression.replace(/\*/g, '\\cdot ')}\\right)\\,d${variable} = ${tex}`);
        setResult(tex);
      }
    } catch {
      setError('Integration failed — check expression');
    }
    setLoading(false);
  }, [expression, variable, isDefinite, lowerBound, upperBound]);

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
    { label: 'sin', value: 'sin(', type: 'func' },
    { label: 'cos', value: 'cos(', type: 'func' },
    { label: 'e', value: 'e^(', type: 'func' },
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

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" async />

      <div className="max-w-5xl mx-auto flex flex-col space-y-4">
        <div className="flex space-x-2 bg-gray-900 p-1 rounded-xl w-fit border border-gray-800">
          <button
            onClick={() => setIsDefinite(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${!isDefinite ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
          >Indefinite (∫)</button>
          <button
            onClick={() => setIsDefinite(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${isDefinite ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
          >Definite (∫ₐᵇ)</button>
        </div>

        <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl space-y-3">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div>Variable: <input type="text" value={variable} onChange={(e) => setVariable(e.target.value)} className="w-8 bg-gray-800 text-center text-blue-400 rounded" /></div>
            {isDefinite && (
              <div className="flex items-center space-x-1">
                <span>Bounds:</span>
                <input type="text" value={lowerBound} onChange={(e) => setLowerBound(e.target.value)} className="w-10 bg-gray-800 text-center text-amber-400 rounded" />
                <span>to</span>
                <input type="text" value={upperBound} onChange={(e) => setUpperBound(e.target.value)} className="w-10 bg-gray-800 text-center text-amber-400 rounded" />
              </div>
            )}
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
            {loading ? 'Computing...' : 'INTEGRATE'}
          </button>

          <div className="min-h-[80px] bg-gray-950/60 rounded-xl p-4 flex items-center justify-center overflow-x-auto">
            {error
              ? <span className="text-sm text-red-400 font-mono">{error}</span>
              : displayFormula
              ? <div className="text-xl text-emerald-400"><MathDisplay formula={displayFormula} /></div>
              : <span className="text-sm text-gray-600">Waiting...</span>
            }
          </div>
        </div>

        <div className="p-4 bg-gray-800/60 rounded-2xl border border-gray-700">
          <div className="grid grid-cols-5 gap-2">
            {keypadButtons.map((btn, index) => (
              <button
                key={index}
                onClick={() => handleKeyPress(btn.value)}
                className={`h-14 rounded-xl font-medium text-lg active:scale-95 transition flex items-center justify-center ${
                  btn.type === 'action' ? 'bg-red-600/80 text-white' :
                  btn.type === 'var' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' :
                  btn.type === 'func' ? 'bg-purple-600/20 text-purple-400' :
                  btn.type === 'op' ? 'bg-amber-600/20 text-amber-400 font-bold' :
                  'bg-gray-700 text-gray-100'
                }`}
              >{btn.label}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}