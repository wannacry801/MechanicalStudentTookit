import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UnitProvider } from './context/UnitContext';
import { Layout } from './components/Layout';
import Differentiation from './pages/math/Differentiation';
import Integration from './pages/math/Integration'; 
import LinearAlgebra from './pages/math/LinearAlgebra';// 1. ดึงไฟล์อินทิเกรตเข้ามา
import OdeSolver from './pages/math/OdeSolver'; // 2. ดึงไฟล์ ODE Solver 
import GraphPlotter from './pages/math/GraphPlotter';
import DynamicsKinematics from './pages/me/DynamicsKinematics'; // 3. ดึงไฟล์ Dynamics & Kinematics เข้ามา
import MechMatBeam from './pages/me/MechMatBeam'; // 4. ดึงไฟล์ Mechanics of Materials - Beam Analysis เข้ามา
import StaticsTruss from './pages/me/StaticsTruss'; // 5. ดึงไฟล์ Statics - Truss Analysis เข้ามา
import VaporTable from './pages/me/thermo/VaporTable';
import Thermo from './pages/me/thermo/Thermo'; // 6. ดึงไฟล์ Thermodynamics เข้ามา
import CDictionary from './pages/programming/CDictionary';
import PyDictionary from './pages/programming/PYDictionary';
import Dashboard from './pages/Dashboard'; // 7. ดึงไฟล์ Dashboard เข้ามา

function App() {
  return (
    <UnitProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div className="text-gray-400">Welcome! Select a module from the sidebar.</div>} />
            <Route path="math/diff" element={<Differentiation />} />
            <Route path="math/int" element={<Integration />} /> {/* 2. เปิดเลนถนนให้วิ่งมาหน้านี้ได้ */}
            <Route path="math/lin-alg" element={<LinearAlgebra />} /> {/* 3. เตรียมเลนถนนให้วิ่งมาหน้านี้ได้ */}
            <Route path="math/ode" element={<OdeSolver />} /> {/* 4. เตรียมเลนถนนให้วิ่งมาหน้านี้ได้ */}
            <Route path="math/plot" element={<GraphPlotter />} /> {/* 5. เตรียมเลนถนนให้วิ่งมาหน้านี้ได้ */}
            <Route path="me/dynamics-kinematics" element={<DynamicsKinematics />} /> {/* 6. เตรียมเลนถนนให้วิ่งมาหน้านี้ได้ */}
            <Route path="me/mech-mat-beam" element={<MechMatBeam />} /> {/* 7. เตรียมเลนถนนให้วิ่งมาหน้านี้ได้ */}
            <Route path="me/statics-truss" element={<StaticsTruss />} /> {/* 8. เตรียมเลนถนนให้วิ่งมาหน้านี้ได้ */}
            <Route path="me/thermo/vapor-table" element={<VaporTable />} /> {/* 9. เตรียมเลนถนนให้วิ่งมาหน้านี้ได้ */}
            <Route path="me/thermo/thermodynamics" element={<Thermo />} /> {/* 10. เตรียมเลนถนนให้วิ่งมาหน้านี้ได้ */}
            <Route path="programming/c-dictionary" element={<CDictionary />} /> {/* 11. เตรียมเลนถนนให้วิ่งมาหน้านี้ได้ */}
            <Route path="programming/python-dictionary" element={<PyDictionary />} /> {/* 12. เตรียมเลนถนนให้วิ่งมาหน้านี้ได้ */}
            <Route path="dashboard" element={<Dashboard />} /> {/* 13. เตรียมเลนถนนให้วิ่งมาหน้านี้ได้ */}
          </Route>
        </Routes>
      </BrowserRouter>
    </UnitProvider>
  );
}

export default App;