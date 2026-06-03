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

// Format number for LaTeX output
function fmtNum(n, decimals = 4) {
  if (typeof n !== 'number') return String(n);
  const r = Math.round(n * 1e10) / 1e10;
  if (Number.isInteger(r)) return String(r);
  // Try fraction representation
  for (let d = 2; d <= 100; d++) {
    const num = Math.round(r * d);
    if (Math.abs(num / d - r) < 1e-9) {
      return `\\frac{${num}}{${d}}`;
    }
  }
  return r.toFixed(decimals);
}

function matrixToTeX(m) {
  if (!m || m.length === 0) return '';
  const rows = m.map(row => row.map(v => fmtNum(v, 3)).join(' & '));
  return `\\begin{pmatrix} ${rows.join(' \\\\ ')} \\end{pmatrix}`;
}

function vecToTeX(v) {
  if (!v || v.length === 0) return '';
  return `\\begin{pmatrix} ${v.map(x => fmtNum(x, 3)).join(' \\\\ ')} \\end{pmatrix}`;
}

// Load Math.js dynamically
async function loadMathJs() {
  if (window.math) return window.math;
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.11.0/math.min.js';
  script.async = true;
  return new Promise((resolve) => {
    script.onload = () => resolve(window.math);
    document.head.appendChild(script);
  });
}

export default function LinearAlgebra() {
  const [matrixSize, setMatrixSize] = useState(3);
  const [matrixA, setMatrixA] = useState(
    [...Array(3)].map((_, i) => [...Array(3)].map((_, j) => i === j ? '1' : '0'))
  );
  const [vectorB, setVectorB] = useState(['0', '0', '0']);
  const [activeInput, setActiveInput] = useState({ type: 'A', r: 0, c: 0 });
  const [operation, setOperation] = useState('all');
  const [results, setResults] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const changeMatrixSize = (newSize) => {
    setMatrixSize(newSize);
    setMatrixA([...Array(newSize)].map((_, i) => [...Array(newSize)].map((_, j) => i === j ? '1' : '0')));
    setVectorB([...Array(newSize)].map(() => '0'));
    setActiveInput({ type: 'A', r: 0, c: 0 });
    setResults({});
  };

  const parseMatrix = () => {
    try {
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
      return { A, b };
    } catch (err) {
      throw new Error('Invalid Matrix Elements');
    }
  };

  const calculate = async () => {
    setLoading(true);
    setError('');
    setResults({});

    try {
      const { A, b } = parseMatrix();
      const math = await loadMathJs();

      const newResults = {};

      // 1. Determinant
      if (matrixSize === matrixSize) {
        try {
          const det = math.det(A);
          newResults.det = fmtNum(det, 4);
        } catch {
          newResults.det = 'N/A (not square)';
        }
      }

      // 2. Trace
      try {
        const trace = math.trace(A);
        newResults.trace = fmtNum(trace, 4);
      } catch {
        newResults.trace = 'N/A';
      }

      // 3. Rank
      try {
        const rank = math.rank(A);
        newResults.rank = String(rank);
      } catch {
        newResults.rank = 'N/A';
      }

      // 4. Frobenius Norm
      try {
        let frobNorm = 0;
        for (let i = 0; i < A.length; i++) {
          for (let j = 0; j < A[i].length; j++) {
            frobNorm += A[i][j] * A[i][j];
          }
        }
        frobNorm = Math.sqrt(frobNorm);
        newResults.frobNorm = fmtNum(frobNorm, 4);
      } catch {
        newResults.frobNorm = 'N/A';
      }

      // 5. Condition Number
      try {
        if (matrixSize === matrixSize) {
          const inv = math.inv(A);
          let normA = 0, normAinv = 0;
          for (let i = 0; i < A.length; i++) {
            for (let j = 0; j < A[i].length; j++) {
              normA += A[i][j] * A[i][j];
              normAinv += inv[i][j] * inv[i][j];
            }
          }
          normA = Math.sqrt(normA);
          normAinv = Math.sqrt(normAinv);
          const condNum = normA * normAinv;
          newResults.condNum = fmtNum(condNum, 4);
        }
      } catch {
        newResults.condNum = 'N/A (singular)';
      }

      // 6. Transpose
      try {
        const AT = math.transpose(A);
        newResults.transpose = matrixToTeX(AT);
      } catch {
        newResults.transpose = 'N/A';
      }

      // 7. Inverse
      let invMatrix = null;
      try {
        const det = math.det(A);
        if (Math.abs(det) > 1e-12) {
          invMatrix = math.inv(A);
          newResults.inverse = matrixToTeX(invMatrix);
        } else {
          newResults.inverse = '\\text{Singular (det = 0)}';
        }
      } catch {
        newResults.inverse = '\\text{Not invertible}';
      }

      // 8. Eigenvalues & Eigenvectors
      try {
        if (matrixSize === matrixSize) {
          const eig = math.eigs(A);
          const evalues = eig.values.map(v => typeof v === 'object' ? v.re : v);
          newResults.eigenvalues = evalues.map((v, i) => fmtNum(v, 4)).join(', ');
          // Display first eigenvector
          if (eig.vectors.length > 0) {
            const evec = eig.vectors[0];
            const vecFormatted = evec.map(v => typeof v === 'object' ? v.re : v);
            newResults.eigenvector = vecToTeX(vecFormatted);
          }
        }
      } catch {
        newResults.eigenvalues = 'N/A (numerical error)';
      }

      // 9. Solution to Ax = b
      try {
        if (invMatrix) {
          const x = math.multiply(invMatrix, b);
          newResults.solution = vecToTeX(x);
        } else {
          const x = math.lusolve(A, b);
          newResults.solution = vecToTeX(x);
        }
      } catch {
        newResults.solution = '\\text{No unique solution}';
      }

      // 10. LU Decomposition
      try {
        const lu = math.lup(A);
        newResults.lu_L = matrixToTeX(lu.L);
        newResults.lu_U = matrixToTeX(lu.U);
      } catch {
        newResults.lu_L = 'N/A';
        newResults.lu_U = 'N/A';
      }

      // 11. QR Decomposition
      try {
        const qr = math.qr(A);
        newResults.qr_Q = matrixToTeX(qr.Q);
        newResults.qr_R = matrixToTeX(qr.R);
      } catch {
        newResults.qr_Q = 'N/A';
        newResults.qr_R = 'N/A';
      }

      setResults(newResults);
    } catch (err) {
      setError(err.message || 'Calculation error');
    }

    setLoading(false);
  };

  const keypadNumbers = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', '.', '-'],
    ['CLEAR', 'BACKSPACE']
  ];

  const operations = [
    { id: 'all', label: '📊 All Operations' },
    { id: 'basic', label: '🔢 Basic (Det, Trace, Rank)' },
    { id: 'decomp', label: '🔗 Decompositions (LU, QR)' },
    { id: 'eigen', label: '⚡ Eigenvalues' },
    { id: 'solve', label: '🔍 Solve Ax=b' },
  ];

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" async />

      <div className="max-w-7xl mx-auto flex flex-col space-y-4">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-2xl border border-blue-800/50">
          <h2 className="text-xl font-bold text-gray-100 mb-2">🧮 Linear Algebra Suite</h2>
          <p className="text-xs text-gray-400">Complete matrix operations with eigenvalue analysis & decompositions</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="p-3 bg-gray-900 rounded-xl border border-gray-800">
            <label className="text-xs font-bold text-gray-400 uppercase">Matrix Size:</label>
            <select 
              value={matrixSize} 
              onChange={(e) => changeMatrixSize(parseInt(e.target.value))}
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded text-sm p-2 text-blue-400"
            >
              {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n}×{n}</option>)}
            </select>
          </div>

          <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Operation Set:</label>
            <select 
              value={operation} 
              onChange={(e) => setOperation(e.target.value)}
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded text-sm p-2 text-purple-400"
            >
              {operations.map(op => <option key={op.id} value={op.id}>{op.label}</option>)}
            </select>
          </div>

          <button
            onClick={calculate}
            disabled={loading}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl font-bold text-white transition shadow-lg col-span-1"
          >
            {loading ? '⏳' : '▶️'} Compute
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Matrix Input */}
            <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl">
              <h3 className="text-sm font-bold text-blue-400 uppercase mb-3">Matrix [A] {matrixSize}×{matrixSize}</h3>
              <div className="flex justify-center p-3 bg-gray-950/40 rounded-lg overflow-x-auto">
                <div className="flex flex-col space-y-2 border-l-2 border-r-2 border-blue-500 px-2">
                  {matrixA.map((row, rIndex) => (
                    <div key={rIndex} className="flex space-x-2">
                      {row.map((cell, cIndex) => (
                        <input
                          key={cIndex}
                          type="text"
                          readOnly
                          value={cell}
                          onClick={() => setActiveInput({ type: 'A', r: rIndex, c: cIndex })}
                          className={`w-12 h-10 text-center font-mono text-sm rounded-lg transition ${
                            activeInput.type === 'A' && activeInput.r === rIndex && activeInput.c === cIndex
                              ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                              : 'bg-gray-800 text-gray-100 border border-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vector B Input */}
              <h3 className="text-sm font-bold text-amber-400 uppercase mt-4 mb-3">Vector {'{B}'}</h3>
              <div className="flex justify-center gap-4 p-3 bg-gray-950/40 rounded-lg">
                <div className="flex flex-col space-y-2 border-l-2 border-r-2 border-amber-500 px-2">
                  {vectorB.map((cell, rIndex) => (
                    <input
                      key={rIndex}
                      type="text"
                      readOnly
                      value={cell}
                      onClick={() => setActiveInput({ type: 'B', r: rIndex, c: 0 })}
                      className={`w-12 h-10 text-center font-mono text-sm rounded-lg transition ${
                        activeInput.type === 'B' && activeInput.r === rIndex
                          ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                          : 'bg-gray-800 text-gray-100 border border-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Keypad */}
            <div className="p-3 bg-gray-800/60 rounded-2xl border border-gray-700">
              <div className="flex flex-col space-y-1.5">
                {keypadNumbers.map((row, rIdx) => (
                  <div key={rIdx} className="flex space-x-1.5">
                    {row.map((btn) => (
                      <button
                        key={btn}
                        onClick={() => handleKeyPress(btn)}
                        className={`flex-1 h-10 rounded-lg text-sm font-bold transition active:scale-95 ${
                          btn === 'CLEAR' ? 'bg-red-600/60 text-red-300' :
                          btn === 'BACKSPACE' ? 'bg-gray-700 text-gray-300' :
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

          {/* Results Section */}
          <div className="lg:col-span-3 space-y-3 max-h-[800px] overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-600 rounded-xl text-red-400 text-xs">
                ⚠ {error}
              </div>
            )}

            {/* Basic Properties */}
            {results.det && (
              <div className="p-3 bg-gray-900/80 rounded-xl border border-blue-700/40">
                <div className="text-xs text-blue-400 font-bold uppercase mb-1">Determinant</div>
                <div className="text-center p-2 bg-gray-950/40 rounded text-sm font-mono">{results.det}</div>
              </div>
            )}

            {results.trace && (
              <div className="p-3 bg-gray-900/80 rounded-xl border border-purple-700/40">
                <div className="text-xs text-purple-400 font-bold uppercase mb-1">Trace</div>
                <div className="text-center p-2 bg-gray-950/40 rounded text-sm font-mono">{results.trace}</div>
              </div>
            )}

            {results.rank && (
              <div className="p-3 bg-gray-900/80 rounded-xl border border-green-700/40">
                <div className="text-xs text-green-400 font-bold uppercase mb-1">Rank</div>
                <div className="text-center p-2 bg-gray-950/40 rounded text-sm font-mono">{results.rank}</div>
              </div>
            )}

            {results.frobNorm && (
              <div className="p-3 bg-gray-900/80 rounded-xl border border-cyan-700/40">
                <div className="text-xs text-cyan-400 font-bold uppercase mb-1">Frobenius Norm</div>
                <div className="text-center p-2 bg-gray-950/40 rounded text-sm font-mono">{results.frobNorm}</div>
              </div>
            )}

            {results.condNum && (
              <div className="p-3 bg-gray-900/80 rounded-xl border border-orange-700/40">
                <div className="text-xs text-orange-400 font-bold uppercase mb-1">Condition Number</div>
                <div className="text-center p-2 bg-gray-950/40 rounded text-sm font-mono">{results.condNum}</div>
              </div>
            )}

            {results.solution && (
              <div className="p-3 bg-gray-900/80 rounded-xl border border-emerald-700/40">
                <div className="text-xs text-emerald-400 font-bold uppercase mb-1">Solution {'{X} = [A]⁻¹{B}'}</div>
                <div className="p-2 bg-gray-950/40 rounded text-center text-sm">
                  <MathDisplay formula={results.solution} />
                </div>
              </div>
            )}

            {results.eigenvalues && (
              <div className="p-3 bg-gray-900/80 rounded-xl border border-yellow-700/40">
                <div className="text-xs text-yellow-400 font-bold uppercase mb-1">Eigenvalues</div>
                <div className="p-2 bg-gray-950/40 rounded text-center text-sm font-mono">{results.eigenvalues}</div>
              </div>
            )}

            {results.eigenvector && (
              <div className="p-3 bg-gray-900/80 rounded-xl border border-yellow-700/40">
                <div className="text-xs text-yellow-400 font-bold uppercase mb-1">First Eigenvector</div>
                <div className="p-2 bg-gray-950/40 rounded text-center text-sm">
                  <MathDisplay formula={results.eigenvector} />
                </div>
              </div>
            )}

            {results.transpose && (
              <div className="p-3 bg-gray-900/80 rounded-xl border border-indigo-700/40">
                <div className="text-xs text-indigo-400 font-bold uppercase mb-1">[A]ᵀ Transpose</div>
                <div className="p-2 bg-gray-950/40 rounded text-center text-xs overflow-x-auto">
                  <MathDisplay formula={results.transpose} />
                </div>
              </div>
            )}

            {results.inverse && (
              <div className="p-3 bg-gray-900/80 rounded-xl border border-pink-700/40">
                <div className="text-xs text-pink-400 font-bold uppercase mb-1">[A]⁻¹ Inverse</div>
                <div className="p-2 bg-gray-950/40 rounded text-center text-xs overflow-x-auto">
                  <MathDisplay formula={results.inverse} />
                </div>
              </div>
            )}

            {results.lu_L && (
              <div className="p-3 bg-gray-900/80 rounded-xl border border-red-700/40">
                <div className="text-xs text-red-400 font-bold uppercase mb-1">LU: Lower [L]</div>
                <div className="p-2 bg-gray-950/40 rounded text-center text-xs overflow-x-auto">
                  <MathDisplay formula={results.lu_L} />
                </div>
              </div>
            )}

            {results.lu_U && (
              <div className="p-3 bg-gray-900/80 rounded-xl border border-red-700/40">
                <div className="text-xs text-red-400 font-bold uppercase mb-1">LU: Upper [U]</div>
                <div className="p-2 bg-gray-950/40 rounded text-center text-xs overflow-x-auto">
                  <MathDisplay formula={results.lu_U} />
                </div>
              </div>
            )}

            {results.qr_Q && (
              <div className="p-3 bg-gray-900/80 rounded-xl border border-cyan-700/40">
                <div className="text-xs text-cyan-400 font-bold uppercase mb-1">QR: Orthogonal [Q]</div>
                <div className="p-2 bg-gray-950/40 rounded text-center text-xs overflow-x-auto">
                  <MathDisplay formula={results.qr_Q} />
                </div>
              </div>
            )}

            {results.qr_R && (
              <div className="p-3 bg-gray-900/80 rounded-xl border border-cyan-700/40">
                <div className="text-xs text-cyan-400 font-bold uppercase mb-1">QR: Upper Triangular [R]</div>
                <div className="p-2 bg-gray-950/40 rounded text-center text-xs overflow-x-auto">
                  <MathDisplay formula={results.qr_R} />
                </div>
              </div>
            )}

            {!Object.keys(results).length && !error && (
              <div className="p-6 text-center text-gray-600 text-sm">
                👆 Enter matrix and click Compute
              </div>
            )}
          </div>
        </div>

        {/* Info Footer */}
        <div className="p-3 bg-gray-900/40 rounded-xl border border-gray-800 text-xs text-gray-500 space-y-1">
          <p><span className="text-gray-400 font-bold">📚 Operations:</span> Determinant • Trace • Rank • Norms • Condition Number • Transpose • Inverse • Eigenvalues • LU & QR Decomposition • Linear System Solution</p>
          <p><span className="text-gray-400 font-bold">💡 Tip:</span> Supports 2×2 to 5×5 matrices. Powered by Math.js for numerical accuracy.</p>
        </div>
      </div>
    </>
  );
}