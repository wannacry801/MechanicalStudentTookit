import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  // ข้อมูลสถิติและเป้าหมายเชิงระบบ (Warranty & Capital)
  const academicStats = [
    { label: 'University Target', value: 'KMITL ', sub: 'ME-RTE' },
    { label: 'Support Program', value: 'Mechanical Engineering', sub: 'Student' },
    { label: 'Core Tech ', value: 'React+Tailwind CSS', sub: 'Native' }
  ];

  // รวบรวม App Modules ทั้งหมดที่สร้างเสร็จแล้วเพื่อทำ Shortcut Link
  const modules = [
    {
      title: 'Mathematics Cluster',
      desc: 'ระบบคำนวณรากฐานเชิงสัญลักษณ์และการจัดการเมทริกซ์',
      color: 'border-blue-500/30 hover:border-blue-500/80 text-blue-400 bg-blue-950/10',
      links: [
        { name: 'Differentiation', path: '/math/diff' },
        { name: 'Integration', path: '/math/int' },
        { name: 'Matrix Linear Algebra', path: '/math/lin-alg' },
        { name: 'Ordinary Differential Equations (ODE)', path: '/math/ode' },
        { name: 'Graph Plotter', path: '/math/plot' }
      ]
    },
    {
      title: 'Mechanical Engineering Core',
      desc: 'เครื่องมือจำลองสถานการณ์และตรวจสอบสมดุลตามโครงสร้าง Hibbeler',
      color: 'border-emerald-500/30 hover:border-emerald-500/80 text-emerald-400 bg-emerald-950/10',
      links: [
        { name: 'Truss Bridge Analysis (Statics)', path: '/me/statics-truss' },
        { name: 'Kinematics Particle Curve (Dynamics)', path: '/me/dynamics-kinematics' },
        { name: 'Shear / Moment Diagrams (MechMat)', path: '/me/mech-mat-beam' }
      ]
    },
    {
      title: 'Thermal & Fluid Science',
      desc: 'เครื่องมือค้นหาและคำนวณคุณสมบัติของสารทำงานและแก๊สอุดมคติ',
      color: 'border-amber-500/30 hover:border-amber-500/80 text-amber-400 bg-amber-950/10',
      links: [
        { name: 'Vapor & Steam Table Solver', path: '/me/thermo' },
        { name: 'Thermodynamics Calculator', path: '/me/thermo/thermodynamics' }
      ]
    },
    {
      title: 'Programming & Hardware IoT',
      desc: 'คลังข้อมูลโครงสร้างภาษาเพื่อควบคุมไมโครคอนโทรลเลอร์',
      color: 'border-purple-500/30 hover:border-purple-500/80 text-purple-400 bg-purple-950/10',
      links: [
        { name: 'C Language Dictionary', path: '/programming/c-dictionary' },
        { name: 'Python Language Dictionary', path: '/programming/python-dictionary' }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      
      {/* 1. Header ต้อนรับสไตล์ล้ำยุค */}
      <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-950 border border-gray-800 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 text-7xl font-mono text-gray-800/10 font-bold select-none">
          ME-RTE
        </div>
        <div className="relative z-10 space-y-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-100 via-gray-300 to-gray-500 bg-clip-text text-transparent">
            Welcome to Engineering Command Center
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            Systems Thinking Dashboard v1.0 • Academic Year 2026
          </p>
        </div>
      </div>

      {/* 2. แผงควบคุม Warranty & Institutional Capital (เป้าหมายหลัก) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {academicStats.map((stat, idx) => (
          <div key={idx} className="p-4 bg-gray-900/80 border border-gray-800 rounded-2xl flex flex-col justify-between space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider font-mono">
              {stat.label}
            </span>
            <span className="text-md font-semibold text-gray-200">
              {stat.value}
            </span>
            <span className="text-xs text-emerald-500 font-mono">
              {stat.sub}
            </span>
          </div>
        ))}
      </div>

      {/* 3. แผงทางลัดเข้าสู่ระบบโมดูลย่อยแยกตามคลัสเตอร์ (Grid Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((mod, idx) => (
          <div key={idx} className={`p-5 border rounded-2xl transition duration-200 shadow-lg flex flex-col justify-between space-y-4 bg-gray-900/40`}>
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider ${mod.color.split(' ')[2]}`}>
                {mod.title}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {mod.desc}
              </p>
            </div>

            {/* รายการ Link ภายในโมดูล */}
            <div className="grid grid-cols-1 gap-2">
              {mod.links.map((link, lIdx) => (
                <Link 
                  key={lIdx} 
                  to={link.path}
                  className="p-2.5 bg-gray-950 border border-gray-800 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-gray-900 font-mono flex justify-between items-center transition"
                >
                  <span>{link.name}</span>
                  <span className="text-gray-600 font-bold">→</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Footer / Copyright */}
      <div className="mt-12 pt-6 border-t border-gray-800">
        <div className="flex flex-col items-center gap-4">
          <p className="text-xs text-gray-500 font-mono">
            © 2026 ME-RTE Engineering Command Center • Wannacry801 • All Rights Reserved
          </p>
          
          {/* GitHub Link Button */}
          <a 
            href="https://github.com/wannacry801" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg hover:border-gray-500 hover:bg-gray-800 transition duration-200 group"
          >
            {/* GitHub Logo SVG */}
            <svg 
              className="w-5 h-5 text-gray-400 group-hover:text-white transition" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v-3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="text-xs font-mono text-gray-400 group-hover:text-gray-200 transition">
              wannacry801
            </span>
          </a>
        </div>
      </div>

    </div>
  );
}
