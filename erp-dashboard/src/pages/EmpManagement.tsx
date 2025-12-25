import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function EmpManagement() {
  const navigate = useNavigate();
  return (
    <div className="p-8">
      <h1 className="text-black text-2xl font-bold mb-4">Employee Management</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-8">
        {/* Attendance Box */}
        <div className="bg-blue-100 border border-blue-300 rounded-xl shadow-md p-8 flex flex-col items-center cursor-pointer hover:bg-blue-200 transition" onClick={() => navigate('/empmanagement/attendance')}>
          <span className="text-4xl mb-4">🕒</span>
          <h2 className="text-black text-xl font-semibold mb-2">Attendance</h2>
          <p className="text-gray-700 text-center">Track and manage employee attendance records.</p>
        </div>
        {/* Add Employee Box */}
        <div className="bg-green-100 border border-green-300 rounded-xl shadow-md p-8 flex flex-col items-center cursor-pointer hover:bg-green-200 transition" onClick={() => navigate('/empmanagement/add-employee')}>
          <span className="text-4xl mb-4">➕</span>
          <h2 className="text-black text-xl font-semibold mb-2">Add Employee</h2>
          <p className="text-gray-700 text-center">Add new employees to your organization.</p>
        </div>
        {/* Work Analysis Box */}
        <div className="bg-yellow-100 border border-yellow-300 rounded-xl shadow-md p-8 flex flex-col items-center cursor-pointer hover:bg-yellow-200 transition" onClick={() => navigate('/empmanagement/work-analysis')}>
          <span className="text-4xl mb-4">📊</span>
          <h2 className="text-black text-xl font-semibold mb-2">Work Analysis</h2>
          <p className="text-gray-700 text-center">Analyze employee work performance and trends.</p>
        </div>
      </div>
    </div>
  );
} 