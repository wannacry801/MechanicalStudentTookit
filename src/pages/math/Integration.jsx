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
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || '').join('') ?? '';
}

export default function Integration() {
  const [expression, setExpression] = useState('x^2 + 3*x + 2');
  const [variable, setVariable] = useState('x');
  const [isDefinite, setIsDefinite] = useState(false);
  const [lowerBound, setLowerBound] = useState('1');
  const [upperBound, setUpperBound] = useState('3');
  const [result, setResult] = useState('');
  const [displayFormula, setDisplayFormula] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const examples = [
    { expr: 'x^2', var: 'x', lower: '0', upper: '2', name: 'Power Rule', type: 'def' },
    { expr: 'sin(x)', var: 'x', lower: '0', upper: '3.14159', name: 'Trigonometry', type: 'def' },
    { expr: 'e^x', var: 'x', lower: '0', upper: '1', name: 'Exponential', type: 'def' },
    { expr: '1/x', var: 'x', lower: '1', upper: 'e', name: 'Logarithmic', type: 'def' },
  ];

  const compute = useCallback(async () => {
    if (!expression.trim()) {
      setError('Expression cannot be empty');
      return;
    }
    setLoading(true);
    setError('');
    setResult('');
    setExplanation('');

    try {
      let prompt;
      if (!isDefinite) {
        prompt = `You are a calculus expert. Compute the indefinite integral of f(${variable}) = ${expression} with respect to ${variable}.

Return ONLY in this exact format:
INTEGRAL: [LaTeX expression including + C]
EXPLANATION: [Brief 1-2 sentence explanation of the integration method]

Do not include markdown, backticks, or preamble.
Example:
INTEGRAL: \\frac{x^{3}}{3} + C
EXPLANATION: Using power rule: ∫x^n dx = x^(n+1)/(n+1) + C`;

        const raw = await callClaude(prompt);
        const integralMatch = raw.match(/INTEGRAL:\s*(.+?)(?:\n|$)/);
        const explainMatch = raw.match(/EXPLANATION:\s*(.+?)(?:\n|$)/);
        
        if (!integralMatch) {
          setError('Failed to compute integral. Try a simpler expression.');
          setLoading(false);
          return;
        }

        const tex = integralMatch[1].trim();
        const explain = explainMatch ? explainMatch[1].trim() : '';
        setDisplayFormula(`\\int \\left(${expression.replace(/\*/g, '\\cdot ')}\\right)\\,d${variable} = ${tex}`);
        setResult(tex);
        setExplanation(explain);
      } else {
        if (!lowerBound || !upperBound) { 
          setError('Please specify both bounds');
          setLoading(false);
          return;
        }
        prompt = `You are a calculus expert. Compute the definite integral of f(${variable}) = ${expression} from ${variable}=${lowerBound} to ${variable}=${upperBound}.

Return ONLY in this exact format:
RESULT: [Exact value (use symbols like ln, sqrt, e, pi), followed by ≈ decimal approximation]
EXPLANATION: [Brief 1-2 sentence explanation of the integration method used]

Do not include markdown, backticks, or preamble. Use unicode ≈ symbol.
Example:
RESULT: ln(3) ≈ 1.0986
EXPLANATION: Using substitution rule and logarithmic properties.`;

        const raw = await callClaude(prompt);
        const resultMatch = raw.match(/RESULT:\s*(.+?)(?:\n|$)/);
        const explainMatch = raw.match(/EXPLANATION:\s*(.+?)(?:\n|$)/);
        
        if (!resultMatch) {
          setError('Failed to compute integral. Check expression and bounds.');
          setLoading(false);
          return;
        }

        const tex = resultMatch[1].trim();
        const explain = explainMatch ? explainMatch[1].trim() : '';
        setDisplayFormula(`\\int_{${lowerBound}}^{${upperBound}} \\left(${expression.replace(/\*/g, '\\cdot ')}\\right)\\,d${variable} = ${tex}`);
        setResult(tex);
        setExplanation(explain);
      }
    } catch (err) {
      setError('Network error or invalid expression. Check your syntax.');
    }
    setLoading(false);
  }, [expression, variable, isDefinite, lowerBound, upperBound]);

  const handleKeyPress = (value) => {
    if (value === 'CLEAR') {
      setExpression('');
      setResult('');
      setDisplayFormula('');
      setExplanation('');
      setError('');
      return;
    }
    if (value === 'BACKSPACE') return setExpression(prev => prev.slice(0, -1));
    setExpression(prev => prev + value);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = (expr, varName, lower, upper) => {
    setExpression(expr);
    setVariable(varName);
    setLowerBound(lower);
    setUpperBound(upper);
    setIsDefinite(true);
    setResult('');
    setDisplayFormula('');
    setExplanation('');
    setError('');
  };

  const keypadButtons = [
    // Row 1
    { label: 'x', value: 'x', type: 'var' },
    { label: 'y', value: 'y', type: 'var' },
    { label: 't', value: 't', type: 'var' },
    { label: 'u', value: 'u', type: 'var' },
    { label: 'C', value: 'CLEAR', type: 'action' },
    
    // Row 2
    { label: 'sin', value: 'sin(', type: 'func' },
    { label: 'cos', value: 'cos(', type: 'func' },
    { label: 'tan', value: 'tan(', type: 'func' },
    { label: 'arcsin', value: 'arcsin(', type: 'func' },
    { label: '⌫', value: 'BACKSPACE', type: 'action' },
    
    // Row 3
    { label: 'ln', value: 'log(', type: 'func' },
    { label: 'log₁₀', value: 'log10(', type: 'func' },
    { label: 'e^', value: 'e^', type: 'func' },
    { label: 'sqrt', value: 'sqrt(', type: 'func' },
    { label: 'abs', value: 'abs(', type: 'func' },
    
    // Row 4
    { label: '7', value: '7', type: 'num' },
    { label: '8', value: '8', type: 'num' },
    { label: '9', value: '9', type: 'num' },
    { label: '^', value: '^', type: 'op' },
    { label: '(', value: '(', type: 'op' },
    
    // Row 5
    { label: '4', value: '4', type: 'num' },
    { label: '5', value: '5', type: 'num' },
    { label: '6', value: '6', type: 'num' },
    { label: '*', value: '*', type: 'op' },
    { label: ')', value: ')', type: 'op' },
    
    // Row 6
    { label: '1', value: '1', type: 'num' },
    { label: '2', value: '2', type: 'num' },
    { label: '3', value: '3', type: 'num' },
    { label: '+', value: '+', type: 'op' },
    { label: '-', value: '-', type: 'op' },
    
    // Row 7
    { label: '0', value: '0', type: 'num' },
    { label: '.', value: '.', type: 'num' },
    { label: 'π', value: 'pi', type: 'const' },
    { label: 'e', value: 'e', type: 'const' },
    { label: '/', value: '/', type: 'op' },
  ];

  const getBtnClass = (type) => {
    const base = "h-12 rounded-lg font-medium text-sm active:scale-95 transition flex items-center justify-center ";
    if (type === 'action') return base + "bg-red-600/80 text-white hover:bg-red-600";
    if (type === 'var') return base + "bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:border-blue-500/60";
    if (type === 'func') return base + "bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:border-purple-500/60";
    if (type === 'op') return base + "bg-amber-600/20 text-amber-400 font-bold border border-amber-500/30 hover:border-amber-500/60";
    if (type === 'const') return base + "bg-green-600/20 text-green-400 border border-green-500/30 hover:border-green-500/60";
    return base + "bg-gray-700 text-gray-100 hover:bg-gray-600";
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" async />

      <div className="max-w-6xl mx-auto flex flex-col space-y-4">
        {/* Toggle: Indefinite / Definite */}
        <div className="flex space-x-2 bg-gray-900 p-1.5 rounded-xl w-fit border border-gray-800 shadow-lg">
          <button
            onClick={() => setIsDefinite(false)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${!isDefinite ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
          >∫ Indefinite</button>
          <button
            onClick={() => setIsDefinite(true)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${isDefinite ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
          >∫ₐᵇ Definite</button>
        </div>

        {/* Main Input Section */}
        <div className="p-6 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-gray-100">Integration Calculator</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Variable:</span>
              <input
                type="text"
                value={variable}
                onChange={(e) => setVariable(e.target.value.trim())}
                className="w-12 bg-gray-800 border border-gray-700 rounded text-center text-sm p-1.5 text-blue-400 font-mono hover:border-blue-500/50"
              />
            </div>
          </div>

          {/* Bounds Section (only for Definite) */}
          {isDefinite && (
            <div className="flex items-center gap-4 p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Integration Bounds:</span>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={lowerBound} 
                  onChange={(e) => setLowerBound(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && compute()}
                  placeholder="Lower"
                  className="w-16 bg-gray-700 border border-gray-600 rounded text-center text-sm p-1.5 text-amber-400 font-mono hover:border-amber-500/50"
                />
                <span className="text-gray-500">to</span>
                <input 
                  type="text" 
                  value={upperBound} 
                  onChange={(e) => setUpperBound(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && compute()}
                  placeholder="Upper"
                  className="w-16 bg-gray-700 border border-gray-600 rounded text-center text-sm p-1.5 text-amber-400 font-mono hover:border-amber-500/50"
                />
              </div>
            </div>
          )}

          {/* Expression Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expression</label>
            <input
              ref={inputRef}
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && compute()}
              placeholder="e.g., x^2 + 3*x + 2"
              className="w-full bg-gray-800/60 text-lg font-mono text-gray-100 focus:outline-none focus:border-blue-500/50 border border-gray-700 rounded-xl p-3 transition"
            />
            <p className="text-xs text-gray-500">Supported: +, -, *, /, ^, sin, cos, tan, log, ln, e^, sqrt, abs, arcsin, arccos, arctan</p>
          </div>

          {/* Compute Button */}
          <button
            onClick={compute}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 active:scale-95 transition text-white font-bold rounded-xl shadow-lg"
          >
            {loading ? '⏳ Computing Integral...' : `🔧 INTEGRATE ${isDefinite ? '(Definite)' : '(Indefinite)'}`}
          </button>

          {/* Result Display */}
          <div className="space-y-3">
            {error && (
              <div className="min-h-[60px] bg-red-950/40 border border-red-700/50 rounded-xl p-4 flex items-center justify-center">
                <span className="text-sm text-red-300 font-mono">⚠ {error}</span>
              </div>
            )}
            
            {displayFormula && (
              <>
                <div className="min-h-[80px] bg-emerald-950/30 border border-emerald-700/50 rounded-xl p-4 flex items-center justify-center overflow-x-auto">
                  <div className="text-xl text-emerald-300">
                    <MathDisplay formula={displayFormula} />
                  </div>
                </div>

                {explanation && (
                  <div className="p-3 bg-gray-800/40 border border-gray-700/50 rounded-xl">
                    <p className="text-xs text-gray-300 italic">📝 Method: {explanation}</p>
                  </div>
                )}

                {result && (
                  <button
                    onClick={copyToClipboard}
                    className="w-full py-2 text-xs font-mono text-gray-400 hover:text-gray-200 bg-gray-800/60 hover:bg-gray-800 border border-gray-700 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {copied ? '✅ Copied!' : '📋 Copy Result'} <code className="text-emerald-400">{result.substring(0, 40)}...</code>
                  </button>
                )}
              </>
            )}

            {!displayFormula && !error && (
              <div className="min-h-[60px] bg-gray-950/60 rounded-xl p-4 flex items-center justify-center">
                <span className="text-sm text-gray-600 italic">Enter expression and click INTEGRATE</span>
              </div>
            )}
          </div>
        </div>

        {/* Examples Section */}
        <div className="p-4 bg-gray-900/60 rounded-2xl border border-gray-800 shadow-lg">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Definite Integral Examples:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => loadExample(ex.expr, ex.var, ex.lower, ex.upper)}
                className="p-2 bg-gray-800/60 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg text-xs font-mono text-gray-300 hover:text-white transition"
              >
                {ex.name}
              </button>
            ))}
          </div>
        </div>

        {/* Keypad Section */}
        <div className="p-4 bg-gray-800/60 rounded-2xl border border-gray-700">
          <div className="grid grid-cols-5 gap-2">
            {keypadButtons.map((btn, index) => (
              <button 
                key={index} 
                onClick={() => handleKeyPress(btn.value)} 
                className={getBtnClass(btn.type)}
                title={btn.label}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="p-4 bg-gray-900/40 rounded-2xl border border-gray-800 text-xs text-gray-400 space-y-2">
          <p><span className="text-gray-300 font-bold">💡 Tips:</span> Use * for multiplication, ^ for power. Press Enter to compute, or click the button.</p>
          <p><span className="text-gray-300 font-bold">🔗 Supported Functions:</span> sin, cos, tan, arcsin, arccos, arctan, log (ln), log10, e^, sqrt, abs</p>
          <p><span className="text-gray-300 font-bold">📊 Modes:</span> Indefinite (∫) computes antiderivative with +C. Definite (∫ₐᵇ) computes exact value and decimal approximation.</p>
        </div>
      </div>
    </>
  );
}