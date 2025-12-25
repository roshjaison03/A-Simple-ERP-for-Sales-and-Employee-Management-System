import React, { useState } from 'react';
import { MdDashboard, MdProductionQuantityLimits, MdShoppingCart, MdPointOfSale, MdAssessment, MdPeople, MdMenu, MdClose } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { icon: <MdPointOfSale size={24} />, label: 'Sales', route: '/sales' },
  { icon: <MdShoppingCart size={24} />, label: 'Purchases' },
  { icon: <MdAssessment size={24} />, label: 'Reports' },
  { icon: <MdPeople size={24} />, label: 'Emp-Manager', route: '/empmanagement' },
];

export default function Sidebar({ hovered, setHovered }) {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('Sales');

  const handleItemClick = (item) => {
    setActiveItem(item.label);
    if (item.route) {
      navigate(item.route);
    } else if (item.label === 'Sales') {
      navigate('/sales');
    }
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {hovered && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setHovered(false)}
        />
      )}
      
      <aside
        className={`
          fixed left-0 top-0 h-full
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          text-white
          flex flex-col
          transition-all duration-300 ease-in-out
          z-50
          shadow-2xl
          border-r border-slate-700
          ${hovered ? 'w-64' : 'w-16'}
        `}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Sidebar"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className={`flex items-center transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3 shadow-lg">
              <MdPointOfSale size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Business
            </h2>
          </div>
          
          {/* Mobile toggle button */}
          <button
            onClick={() => setHovered(!hovered)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {hovered ? <MdClose size={20} /> : <MdMenu size={20} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6">
          <div className="space-y-2 px-3">
            {navItems.map((item, idx) => (
              <div
                key={item.label}
                className={`
                  group relative flex items-center
                  px-3 py-3 rounded-xl cursor-pointer
                  transition-all duration-200 ease-in-out
                  ${activeItem === item.label 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25' 
                    : 'hover:bg-slate-700/50 hover:shadow-md'
                  }
                  ${hovered ? 'justify-start' : 'justify-center'}
                `}
                onClick={() => handleItemClick(item)}
              >
                {/* Active indicator */}
                {activeItem === item.label && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                )}
                
                {/* Icon container */}
                <div className={`
                  flex items-center justify-center
                  transition-all duration-200
                  ${activeItem === item.label ? 'text-white' : 'text-slate-300 group-hover:text-white'}
                `}>
                  {item.icon}
                </div>
                
                {/* Label */}
                <span
                  className={`
                    ml-4 font-medium whitespace-nowrap
                    transition-all duration-300
                    ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
                    ${activeItem === item.label ? 'text-white' : 'text-slate-300 group-hover:text-white'}
                  `}
                >
                  {item.label}
                </span>
                
                {/* Hover tooltip for collapsed state */}
                {!hovered && (
                  <div className="
                    absolute left-16 px-3 py-2 bg-slate-900 text-sm text-white
                    rounded-lg shadow-lg opacity-0 pointer-events-none
                    group-hover:opacity-100 group-hover:pointer-events-auto
                    transition-opacity duration-200 whitespace-nowrap
                    border border-slate-600 z-10
                  ">
                    {item.label}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 border-l border-t border-slate-600 rotate-45" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-slate-700 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-sm font-semibold">U</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">User Name</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// Demo wrapper component
function App() {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar hovered={hovered} setHovered={setHovered} />
      <main className={`transition-all duration-300 ${hovered ? 'ml-64' : 'ml-16'} p-8`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Content</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Sales Overview</h3>
              <p className="text-gray-600">Track your sales performance and trends.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Inventory Status</h3>
              <p className="text-gray-600">Monitor stock levels and inventory updates.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Reports</h3>
              <p className="text-gray-600">View and analyze recent business reports.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}