import { useState, useEffect, useRef } from 'react';

function MathDisplay({ formula }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.katex) {
      try {
        window.katex.render(formula, ref.current, { displayMode: true, throwOnError: false });
      } catch (e) {
        if (ref.current) ref.current.textContent = formula;
      }
    }
  }, [formula]);
  return <span ref={ref} />;
}

// ── Pure-JS helpers (no nerdamer needed) ──────────────────────────────────────

function det3(m) {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

function inv3(m, det) {
  const d = det;
  return [
    [
      (m[1][1]*m[2][2] - m[1][2]*m[2][1]) / d,
      (m[0][2]*m[2][1] - m[0][1]*m[2][2]) / d,
      (m[0][1]*m[1][2] - m[0][2]*m[1][1]) / d,
    ],
    [
      (m[1][2]*m[2][0] - m[1][0]*m[2][2]) / d,
      (m[0][0]*m[2][2] - m[0][2]*m[2][0]) / d,
      (m[0][2]*m[1][0] - m[0][0]*m[1][2]) / d,
    ],
    [
      (m[1][0]*m[2][1] - m[1][1]*m[2][0]) / d,
      (m[0][1]*m[2][0] - m[0][0]*m[2][1]) / d,
      (m[0][0]*m[1][1] - m[0][1]*m[1][0]) / d,
    ],
  ];
}

// Multiply 3x3 matrix by 3x1 vector
function mulMV(m, v) {
  return m.map(row => row.reduce((sum, val, j) => sum + val * v[j], 0));
}

// Format number for LaTeX: trim floating point noise, show fractions if clean
function fmtNum(n) {
  const r = Math.round(n * 1e10) / 1e10;
  if (Number.isInteger(r)) return String(r);
  // Try to express as fraction with small denominator
  for (let d = 2; d <= 100; d++) {
    const num = Math.round(r * d);
    if (Math.abs(num / d - r) < 1e-9) {
      return num < 0 ? `\\frac{${num}}{${d}}` : `\\frac{${num}}{${d}}`;
    }
  }
  return r.toFixed(4);
}

function matrixToTeX(m) {
  const rows = m.map(row => row.map(fmtNum).join(' & '));
  return `\\begin{pmatrix} ${rows.join(' \\\\ ')} \\end{pmatrix}`;
}

function vecToTeX(v) {
  return `\\begin{pmatrix} ${v.map(fmtNum).join(' \\\\ ')} \\end{pmatrix}`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function LinearAlgebra() {
  const [matrixA, setMatrixA] = useState([
    ['1', '0', '0'],
    ['0', '1', '0'],
    ['0', '0', '1']
  ]);
  const [vectorB, setVectorB] = useState(['0', '0', '0']);
  const [activeInput, setActiveInput] = useState({ type: 'A', r: 0, c: 0 });
  const [result, setResult] = useState({ det: '', inv: '', solution: '' });
  const [error, setError] = useState('');

  const handleCellChange = (row, col, value, type = 'A') => {
    if (type === 'A') {
      setMatrixA(prev => prev.map((r, ri) => r.map((c, ci) => ri === row && ci === col ? value : c)));
    } else {
      setVectorB(prev => prev.map((v, i) => i === row ? value : v));
    }
  };

  const handleKeyPress = (num) => {
    if (activeInput.type === 'A') {
      const currentVal = matrixA[activeInput.r][activeInput.c];
      const newVal = num === 'CLEAR' ? '' : num === 'BACKSPACE' ? currentVal.slice(0, -1) : currentVal + num;
      handleCellChange(activeInput.r, activeInput.c, newVal, 'A');
    } else {
      const currentVal = vectorB[activeInput.r];
      const newVal = num === 'CLEAR' ? '' : num === 'BACKSPACE' ? currentVal.slice(0, -1) : currentVal + num;
      handleCellChange(activeInput.r, 0, newVal, 'B');
    }
  };

  const calculateMatrix = () => {
    try {
      // Parse all values — throw if any cell is blank or non-numeric
      const A = matrixA.map(row =>
        row.map(cell => {
          const n = parseFloat(cell);
          if (cell.trim() === '' || isNaN(n)) throw new Error('Invalid cell');
          return n;
        })
      );
      const b = vectorB.map(cell => {
        const n = parseFloat(cell);
        if (cell.trim() === '' || isNaN(n)) throw new Error('Invalid cell');
        return n;
      });

      const d = det3(A);
      const detTeX = fmtNum(d);

      let invTeX = '\\text{Does not exist} \\ (\\det = 0)';
      let solTeX = '\\text{No unique solution}';

      if (Math.abs(d) > 1e-12) {
        const invA = inv3(A, d);
        invTeX = matrixToTeX(invA);
        const x = mulMV(invA, b);
        solTeX = vecToTeX(x);
      }

      setResult({ det: detTeX, inv: invTeX, solution: solTeX });
      setError('');
    } catch (err) {
      setError('Invalid Matrix Elements (ตรวจเช็กช่องว่างหรือรูปแบบตัวเลข)');
    }
  };

  const keypadNumbers = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', '.', '-'],
    ['CLEAR', 'BACKSPACE']
  ];

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" async />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ฝั่งซ้าย */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              System of Equations: [A]&#123;X&#125; = &#123;B&#125;
            </h3>

            <div className="flex items-center space-x-6 justify-center p-4 bg-gray-950/40 rounded-xl">
              {/* Matrix A */}
              <div className="flex flex-col space-y-2 border-l-2 border-r-2 border-blue-500 px-3">
                {matrixA.map((row, rIndex) => (
                  <div key={rIndex} className="flex space-x-2">
                    {row.map((cell, cIndex) => (
                      <input
                        key={cIndex}
                        type="text"
                        readOnly
                        value={cell}
                        onClick={() => setActiveInput({ type: 'A', r: rIndex, c: cIndex })}
                        className={`w-14 h-12 text-center font-mono rounded-lg focus:outline-none transition ${
                          activeInput.type === 'A' && activeInput.r === rIndex && activeInput.c === cIndex
                            ? 'bg-blue-600 text-white font-bold ring-2 ring-blue-400'
                            : 'bg-gray-800 text-gray-100 border border-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className="text-xl font-bold text-gray-500">×</div>

              {/* X vector labels */}
              <div className="flex flex-col space-y-4 font-mono text-gray-400 text-sm border-l border-r border-gray-700 px-3">
                <div className="h-10 flex items-center justify-center">x₁</div>
                <div className="h-10 flex items-center justify-center">x₂</div>
                <div className="h-10 flex items-center justify-center">x₃</div>
              </div>

              <div className="text-xl font-bold text-gray-500">=</div>

              {/* Vector B */}
              <div className="flex flex-col space-y-2 border-l-2 border-r-2 border-amber-500 px-3">
                {vectorB.map((cell, rIndex) => (
                  <input
                    key={rIndex}
                    type="text"
                    readOnly
                    value={cell}
                    onClick={() => setActiveInput({ type: 'B', r: rIndex, c: 0 })}
                    className={`w-14 h-12 text-center font-mono rounded-lg focus:outline-none transition ${
                      activeInput.type === 'B' && activeInput.r === rIndex
                        ? 'bg-amber-600 text-white font-bold ring-2 ring-amber-400'
                        : 'bg-gray-800 text-gray-100 border border-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={calculateMatrix}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 transition text-white font-bold rounded-xl shadow-lg"
            >
              COMPUTE MATRIX OPERATIONS
            </button>
          </div>

          {/* Numpad */}
          <div className="p-4 bg-gray-800/60 rounded-2xl border border-gray-700">
            <div className="flex flex-col space-y-2">
              {keypadNumbers.map((row, rIdx) => (
                <div key={rIdx} className="flex space-x-2">
                  {row.map((btn) => (
                    <button
                      key={btn}
                      onClick={() => handleKeyPress(btn)}
                      className={`flex-1 h-12 rounded-xl text-lg font-medium transition active:scale-95 ${
                        btn === 'CLEAR' ? 'bg-red-600/20 text-red-400 font-bold' :
                        btn === 'BACKSPACE' ? 'bg-gray-700 text-gray-300 font-bold' :
                        'bg-gray-700 hover:bg-gray-600 text-white'
                      }`}
                    >
                      {btn === 'CLEAR' ? 'C' : btn === 'BACKSPACE' ? '⌫' : btn}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ฝั่งขวา: Results */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-gray-900 rounded-2xl border border-gray-800 min-h-[420px] space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-md font-bold text-gray-300 border-b border-gray-800 pb-2">Results</h3>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-500/40 rounded-xl text-red-400 text-xs font-mono">
                  {error}
                </div>
              )}

              {/* Determinant */}
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Determinant:</div>
                <div className="p-2 bg-gray-950/60 rounded-xl text-blue-400 font-mono text-center min-h-[40px] flex items-center justify-center">
                  {result.det ? <MathDisplay formula={`|A| = ${result.det}`} /> : '-'}
                </div>
              </div>

              {/* Solution */}
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Vector Solution &#123;X&#125;:</div>
                <div className="p-3 bg-gray-950/60 rounded-xl text-emerald-400 text-center min-h-[60px] flex items-center justify-center">
                  {result.solution ? <MathDisplay formula={`\\{X\\} = ${result.solution}`} /> : '-'}
                </div>
              </div>

              {/* Inverse */}
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Inverse Matrix [A]⁻¹:</div>
                <div className="p-3 bg-gray-950/60 rounded-xl text-purple-400 text-center min-h-[80px] flex items-center justify-center overflow-x-auto">
                  {result.inv ? <MathDisplay formula={`[A]^{-1} = ${result.inv}`} /> : '-'}
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] text-gray-600 font-mono">
              Analytical Fractional Outputs Ready
            </div>
          </div>
        </div>
      </div>
    </>
  );
}