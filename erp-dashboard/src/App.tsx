import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sales from './pages/Sales';
import Sidebar from './components/Sidebar';
import ClientDetailsPage from './pages/ClientDetailsPage';
import EmpManagement from './pages/EmpManagement';
import AttendancePage from './pages/AttendancePage';
import AddEmployeePage from './pages/AddEmployeePage';
// import WorkAnalysisPage from './pages/WorkAnalysisPage';

export default function App() {
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <BrowserRouter>
      <div className="relative w-full h-screen overflow-hidden">
        {/* Overlay and Sidebar as overlays */}
        {sidebarHovered && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-40"
              onClick={() => setSidebarHovered(false)}
              aria-label="Sidebar overlay"
            />
            <div className="fixed top-0 left-0 h-full z-50">
              <Sidebar hovered={sidebarHovered} setHovered={setSidebarHovered} />
            </div>
          </>
        )}
        <main className="flex flex-col flex-grow w-full bg-white h-screen transition-all duration-300 relative z-10">
          <Routes>
            <Route path="/" element={<></>} />
            <Route path="/sales" element={<Sales sidebarHovered={sidebarHovered} setSidebarHovered={setSidebarHovered} />} />
            <Route path="/client/:clientId" element={<ClientDetailsPage />} />
            <Route path="/empmanagement" element={<EmpManagement />} />
            <Route path="/empmanagement/attendance" element={<AttendancePage />} />
            <Route path="/empmanagement/add-employee" element={<AddEmployeePage />} />
            {/* <Route path="/empmanagement/work-analysis" element={<WorkAnalysisPage />} /> */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
