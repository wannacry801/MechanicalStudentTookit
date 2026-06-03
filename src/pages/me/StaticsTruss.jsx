import React, { useState, useEffect } from 'react';
import nerdamer from 'nerdamer';
import { MathDisplay } from '../../components/KaTeXWrapper';

export default function StaticsTruss() {
  // ค่าแรงภายนอกที่กดลงบนข้อต่อ (Joint Loads)
  const [loadP1, setLoadP1] = useState('10'); // แรงกดลงที่ Joint C (kN)
  const [loadP2, setLoadP2] = useState('5');  // แรงดันไปทางขวาที่ Joint C (kN)
  const [trussHeight, setTrussHeight] = useState('3'); // ความสูงโครงถัก (m)
  const [trussWidth, setTrussWidth] = useState('4');  // ความกว้างแต่ละช่วง (m)

  const [results, setResults] = useState({});
  const [error, setError] = useState('');

  // Core Statics Engine: คำนวณแรงภายในชิ้นส่วนด้วย Global Matrix
  useEffect(() => {
    const P1 = parseFloat(loadP1);
    const P2 = parseFloat(loadP2);
    const h = parseFloat(trussHeight);
    const w = parseFloat(trussWidth);

    if (isNaN(P1) || isNaN(P2) || isNaN(h) || isNaN(w) || h <= 0 || w <= 0) return;

    try {
      // คำนวณมุม θ ของโครงถักชิ้นส่วนเฉียง
      const cosTheta = w / Math.sqrt(w*w + h*h);
      const sinTheta = h / Math.sqrt(w*w + h*h);

      /*
        สมมุติโครงถัก 4 ข้อต่อ (A, B, C, D) สไตล์ยอดฮิตใน Hibbeler:
        A อยู่ล่างซ้าย (Pin Support), B อยู่ล่างขวา (Roller Support), C อยู่บนซ้าย, D อยู่บนขวา
        เราจะตั้งสมการสมดุลที่จุดต่อเพื่อสร้าง Matrix แก้สมการหาแรงในชิ้นส่วน (F_AC, F_AB, F_CD, F_BD, F_BC)
        และแรงปฏิกิริยา (R_Ax, R_Ay, R_By) รวม 8 ตัวแปร
      */
      
      // คำนวณ Reactions แบบลัดจากสมดุลภายนอกก่อน (ΣM_A = 0)
      // P1 * w + P2 * h - R_By * (2 * w) = 0
      const R_By = (P1 * w + P2 * h) / (2 * w);
      const R_Ay = P1 - R_By;
      const R_Ax = -P2;

      // คำนวณแรงภายในชิ้นส่วนด้วย Method of Joints สัญลักษณ์
      // Joint A: ΣF_y = 0 -> R_Ay + F_AC * sinθ = 0 -> F_AC
      const F_AC = -R_Ay / sinTheta;
      // Joint A: ΣF_x = 0 -> R_Ax + F_AB + F_AC * cosθ = 0 -> F_AB
      const F_AB = -R_Ax - (F_AC * cosTheta);

      // Joint C: ΣF_y = 0 -> -F_AC * sinθ - F_CB = 0 -> F_BC
      const F_BC = -F_AC * sinTheta;
      
      // Joint B: ΣF_y = 0 -> R_By + F_BD * sinθ = 0 -> F_BD
      const F_BD = -R_By / sinTheta;
      // Joint B: ΣF_x = 0 -> -F_AB - F_BD * cosθ = 0
      const F_CD = F_AB + (F_BD * cosTheta); // แรงแนวราบด้านบน

      setResults({
        RAx: R_Ax.toFixed(2),
        RAy: R_Ay.toFixed(2),
        RBy: R_By.toFixed(2),
        FAC: `${F_AC.toFixed(2)} kN ${F_AC < 0 ? '(C)' : '(T)'}`,
        FAB: `${F_AB.toFixed(2)} kN ${F_AB < 0 ? '(C)' : '(T)'}`,
        FBC: `${F_BC.toFixed(2)} kN ${F_BC < 0 ? '(C)' : '(T)'}`,
        FBD: `${F_BD.toFixed(2)} kN ${F_BD < 0 ? '(C)' : '(T)'}`,
        FCD: `${F_CD.toFixed(2)} kN ${F_CD < 0 ? '(C)' : '(T)'}`,
      });
      setError('');
    } catch (err) {
      setError('Statics Equilibrium Matrix Miscalculation');
    }
  }, [loadP1, loadP2, trussHeight, trussWidth]);

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* ฝั่งซ้าย: ตัวป้อนโหลดโครงสร้างวิศวกรรม (5 Columns) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Truss Bridge Analyzer (Ch.6)</h3>
          
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Truss Width ($w$ - m)</label>
                <input type="number" value={trussWidth} onChange={(e) => setTrussWidth(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-center text-blue-400 font-mono" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Truss Height ($h$ - m)</label>
                <input type="number" value={trussHeight} onChange={(e) => setTrussHeight(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-center text-blue-400 font-mono" />
              </div>
            </div>

            <div className="border-t border-gray-800 pt-3 space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">External Loads on Joint</span>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Vertical Force $P_1$ (kN)</label>
                <input type="number" value={loadP1} onChange={(e) => setLoadP1(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-center text-amber-500 font-mono" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Horizontal Force $P_2$ (kN)</label>
                <input type="number" value={loadP2} onChange={(e) => setLoadP2(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2 text-center text-amber-500 font-mono" />
              </div>
            </div>
          </div>
        </div>

        {/* บล็อกแสดงคำแนะนำสัญกรณ์ทางวิศวกรรมเครื่องกล */}
        <div className="p-4 bg-gray-950/40 border border-gray-800 rounded-xl text-xs text-gray-500 space-y-1">
          <div>💡 <span className="text-gray-400 font-bold">(T) = Tension</span>: ชิ้นส่วนรับแรงดึง (ค่าสัมประสิทธิ์เป็นบวก)</div>
          <div>💡 <span className="text-gray-400 font-bold">(C) = Compression</span>: ชิ้นส่วนรับแรงอัด (ค่าสัมประสิทธิ์เป็นลบ)</div>
        </div>
      </div>

      {/* ฝั่งขวา: พ่นตารางแรงผลลัพธ์ในแต่ละชิ้นส่วน (7 Columns) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="p-5 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl space-y-4">
          <h3 className="text-md font-bold text-gray-200 border-b border-gray-800 pb-2">Internal Member Forces</h3>

          {error && <div className="p-3 bg-red-900/20 border border-red-500/40 rounded-xl text-red-400 text-xs font-mono">{error}</div>}

          {/* ตารางข้อมูลสรุปแรงดัน-แรงดึง */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
              <span className="text-gray-500 block mb-1">Member AC (Diagonal):</span>
              <span className="text-emerald-400 text-sm font-bold">{results.FAC || '-'}</span>
            </div>
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
              <span className="text-gray-500 block mb-1">Member AB (Bottom):</span>
              <span className="text-emerald-400 text-sm font-bold">{results.FAB || '-'}</span>
            </div>
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
              <span className="text-gray-500 block mb-1">Member BC (Vertical):</span>
              <span className="text-emerald-400 text-sm font-bold">{results.FBC || '-'}</span>
            </div>
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800">
              <span className="text-gray-500 block mb-1">Member BD (Diagonal):</span>
              <span className="text-emerald-400 text-sm font-bold">{results.FBD || '-'}</span>
            </div>
            <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 col-span-2">
              <span className="text-gray-500 block mb-1">Member CD (Top Chord):</span>
              <span className="text-purple-400 text-sm font-bold">{results.FCD || '-'}</span>
            </div>
          </div>

          {/* ตารางแสดงแรงที่ฐานรองรับ */}
          <div className="border-t border-gray-800 pt-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Support Reactions</span>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px] text-center">
              <div className="p-2 bg-gray-950 rounded-lg">
                <div className="text-gray-500">R_Ax</div>
                <div className="text-amber-400 font-bold">{results.RAx || '-'} kN</div>
              </div>
              <div className="p-2 bg-gray-950 rounded-lg">
                <div className="text-gray-500">R_Ay</div>
                <div className="text-amber-400 font-bold">{results.RAy || '-'} kN</div>
              </div>
              <div className="p-2 bg-gray-950 rounded-lg">
                <div className="text-gray-500">R_By</div>
                <div className="text-amber-400 font-bold">{results.RBy || '-'} kN</div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}