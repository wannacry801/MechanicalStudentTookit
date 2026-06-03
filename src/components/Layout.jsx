import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useUnit } from '../context/UnitContext';

export const Layout = () => {
  const { unit, toggleUnit } = useUnit();

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      {/* SIDEBAR: เมนูวิชาเครื่องกล และ Math */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-5 border-b border-gray-700">
          <h1 className="text-xl font-bold text-blue-400">ME Student Toolkit</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dashboard</div>
          <Link to="/dashboard" className="block px-3 py-2 rounded md hover:bg-gray-700 transition">Main Dashboard</Link>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Mathematics</div>
          <Link to="/math/diff" className="block px-3 py-2 rounded md hover:bg-gray-700 transition">8.1.1 Differentiation</Link>
          <Link to="/math/int"  className="block px-3 py-2 rounded md hover:bg-gray-700 transition">8.1.2 Integration</Link>
          <Link to="/math/lin-alg"  className="block px-3 py-2 rounded md hover:bg-gray-700 transition">8.1.3 Linear Algebra</Link>
          <Link to="/math/ode"  className="block px-3 py-2 rounded md hover:bg-gray-700 transition">8.1.4 Ordinary Differential Equations</Link>
          <Link to="/math/plot"  className="block px-3 py-2 rounded md hover:bg-gray-700 transition">8.1.5 Graph Plotter</Link>
          
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">Mechanical Core</div>
          <Link to="/me/dynamics-kinematics" className="block px-3 py-2 rounded md hover:bg-gray-700 transition">12.1 Dynamics & Kinematics</Link>
          <Link to="/me/mech-mat-beam" className="block px-3 py-2 rounded md hover:bg-gray-700 transition">12.2 Beam Analysis</Link>
          <Link to="/me/statics-truss" className="block px-3 py-2 rounded md hover:bg-gray-700 transition">12.3 Truss Analysis</Link>
          <span className="block px-3 py-2 text-gray-500 cursor-not-allowed">Mechanics of Materials (Soon)</span>
          
          {/* วางไว้ต่อท้ายบทกลุ่มวิชา Mechanics เดิมได้เลยครับ */}
<div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">Thermal & Fluid Science</div>
          <Link to="/me/thermo/vapor-table" className="block px-3 py-2 rounded md hover:bg-gray-700 transition">13.1 Vapor Table</Link>
          <Link to="/me/thermo/thermodynamics" className="block px-3 py-2 rounded md hover:bg-gray-700 transition">13.2 Thermodynamics</Link>

          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">Programming</div>
          <Link to="/programming/c-dictionary" className="block px-3 py-2 rounded md hover:bg-gray-700 transition">C Dictionary</Link>
          <Link to="/programming/python-dictionary" className="block px-3 py-2 rounded md hover:bg-gray-700 transition">Python Dictionary</Link>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* NAVBAR */}
        <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
          <div className="text-sm text-gray-400">Dashboard / Calculator</div>
          {/* ปุ่ม Toggle สลับหน่วยระดับ Global */}
          <button 
            onClick={toggleUnit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 transition rounded-lg text-sm font-medium"
          >
            Unit System: {unit}
          </button>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-950">
          {/* หน้าเว็บย่อยจาก Router จะมาแสดงผลที่ Outlet ตรงนี้ */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};