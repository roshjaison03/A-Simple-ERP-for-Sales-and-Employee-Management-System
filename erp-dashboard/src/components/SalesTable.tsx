import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { FiSearch } from 'react-icons/fi';

export default function SalesTable({ sidebarHovered, setSidebarHovered }: { sidebarHovered: boolean, setSidebarHovered: (v: boolean) => void }) {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddClient, setShowAddClient] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [clientForm, setClientForm] = useState({
    clientName: '',
    dateJoined: new Date().toISOString().slice(0, 10),
    companyType: '',
    gstNo: '',
    address: '',
    email: '',
    phone: '',
  });
  const [addClientLoading, setAddClientLoading] = useState(false);
  const [addClientError, setAddClientError] = useState<string | null>(null);
  const companyTypeOptions = [
    { value: '', label: 'Select company type' },
    { value: 'Proprietorship', label: 'Proprietorship' },
    { value: 'Service Based', label: 'Service Based' },
  ];

  // New: State to hold total bills, total paid, and uncleared bills for each client
  const [clientBills, setClientBills] = useState<{ [key: number]: { total_bills?: number, total_paid?: number, unpaid_bills?: number } }>({});
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Filter salesData based on searchTerm
  const filteredSalesData = salesData.filter((row: any) => {
    const idMatch = row.id?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    const clientMatch = (row.client_name || row.client || '').toLowerCase().includes(searchTerm.toLowerCase());
    return idMatch || clientMatch;
  });

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/sales`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setSalesData(data);
        setLoading(false);
        // Fetch total bills and total paid for each client
        data.forEach((row: any) => {
          fetch(`${API_BASE_URL}/api/clientbills/${row.id}`)
            .then(res => res.json())
            .then(billData => {
              setClientBills(prev => ({
                ...prev,
                [row.id]: {
                  total_bills: billData.total_bills,
                  total_paid: billData.total_amount,
                  unpaid_bills: billData.unpaid_bills
                }
              }));
            })
            .catch(() => {
              setClientBills(prev => ({ ...prev, [row.id]: { total_bills: undefined, total_paid: undefined } }));
            });
        });
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
  return (
    <>
      {/* Header for both mobile and desktop, but with separated layout for desktop */}
      <div className="mb-4">
        {/* Mobile: stacked row as before */}
        <div className="flex items-center gap-2 sm:hidden">
          {/* Hamburger menu for mobile */}
          <button
            className="p-2 rounded bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Open sidebar menu"
            onClick={() => setSidebarHovered(true)}
            type="button"
          >
            <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {/* Mobile search icon */}
          <button
            className="p-2 rounded bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Open search"
            onClick={() => setShowMobileSearch(true)}
            type="button"
          >
            <FiSearch className="w-6 h-6 text-blue-700" />
          </button>
          {/* Mobile Add Client button */}
          <button
            className="p-2 rounded bg-blue-600 text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            onClick={() => setShowAddClient(true)}
          >
            Add Client
          </button>
        </div>
        {/* Desktop: menu left, search/add center, right empty */}
        <div className="hidden sm:flex items-center relative w-full h-14">
          {/* Desktop menu button (left) */}
          <div className="flex items-center h-full">
            <button
              className="p-2 rounded bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Open sidebar menu (desktop)"
              onClick={() => setSidebarHovered(true)}
              type="button"
            >
              <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          {/* Centered search and Add Client */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-stretch gap-2">
            <input
              type="text"
              placeholder="Search by ID or Client Name"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border border-gray-400 rounded px-3 xs:px-4 py-2 text-base xs:text-lg bg-white text-black shadow focus:outline-none focus:ring-2 focus:ring-blue-400 w-full max-w-xl"
              style={{ minWidth: '500px' }}
            />
            <button
              className="bg-white text-slate-700 border border-slate-700 px-6 min-w-[140px] h-full rounded text-base font-semibold shadow hover:bg-slate-100 transition flex items-center justify-center"
              onClick={() => setShowAddClient(true)}
            >
              Add Client
            </button>
          </div>
          {/* Right side empty for now */}
          <div className="flex-1" />
        </div>
      </div>
      <div className="flex flex-col h-full w-full p-2 sm:p-6 text-black">
        {/* Header/Search Area (fixed height) */}
        <div className="flex flex-col sm:flex-row justify-between items-center flex-wrap mb-4 gap-4 flex-shrink-0 w-full">
          <div className="w-full flex flex-col sm:flex-row items-center gap-4">
            {/* Mobile search overlay */}
            {showMobileSearch && (
              <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-40 p-4" onClick={e => e.target === e.currentTarget && setShowMobileSearch(false)}>
                <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md mt-10 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Search by ID or Client Name"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="border border-gray-400 rounded px-4 py-2 text-lg bg-white text-black shadow focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                      autoFocus
                    />
                    <button
                      className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                      onClick={() => setShowMobileSearch(false)}
                      aria-label="Close search"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Add Client Modal (only for mobile) */}
        {showAddClient && (
          <div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 xs:p-4 sm:hidden"
            onClick={(e) => e.target === e.currentTarget && setShowAddClient(false)}
          >
            <div className="bg-white rounded-2xl shadow-2xl p-4 xs:p-8 w-full max-w-2xl relative max-h-[95vh] overflow-y-auto">
              {/* Header */}
              <div className="mb-6 xs:mb-8 flex flex-col items-center">
                <h2 className="text-2xl xs:text-3xl font-extrabold text-blue-800 mb-2 flex items-center gap-2">
                  <svg className="w-6 xs:w-7 h-6 xs:h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add New Client
                </h2>
                <div className="w-12 xs:w-16 h-1 bg-blue-500 rounded-full" />
                <button
                  className="absolute top-2 xs:top-4 right-2 xs:right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  onClick={() => setShowAddClient(false)}
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Form */}
              <form className="space-y-0" onSubmit={async (e) => {
                e.preventDefault();
                setAddClientError(null);
                setAddClientLoading(true);
                try {
                  const res = await fetch(`${API_BASE_URL}/api/add-client`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      client_name: clientForm.clientName,
                      address: clientForm.address,
                      email: clientForm.email,
                      phone_no: clientForm.phone,
                      joined_date: clientForm.dateJoined,
                      company_type: clientForm.companyType,
                      gst_no: clientForm.gstNo,
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || 'Failed to add client');
                  setShowAddClient(false);
                  setClientForm({
                    clientName: '',
                    dateJoined: new Date().toISOString().slice(0, 10),
                    companyType: '',
                    gstNo: '',
                    address: '',
                    email: '',
                    phone: '',
                  });
                  // Refresh sales list
                  setLoading(true);
                  fetch(`${API_BASE_URL}/api/sales`)
                    .then(res => res.json())
                    .then(data => setSalesData(data))
                    .finally(() => setLoading(false));
                } catch (err) {
                  setAddClientError((err as any).message || 'Error adding client');
                } finally {
                  setAddClientLoading(false);
                }
              }}>
                {/* Section: Basic Info */}
                <div className="mb-4">
                  <h3 className="text-base xs:text-lg font-semibold text-blue-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 xs:w-5 h-4 xs:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 xs:gap-x-8 gap-y-4 xs:gap-y-6 px-1 xs:px-2 sm:px-4 md:px-8">
                    {/* Client Name */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                        value={clientForm.clientName}
                        onChange={e => setClientForm(f => ({ ...f, clientName: e.target.value }))}
                        placeholder="First name"
                        required
                      />
                    </div>
                    {/* Date Joined */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Joined</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                        value={clientForm.dateJoined}
                        onChange={e => setClientForm(f => ({ ...f, dateJoined: e.target.value }))}
                        required
                      />
                    </div>
                    {/* Company Type */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                        value={clientForm.companyType}
                        onChange={e => setClientForm(f => ({ ...f, companyType: e.target.value }))}
                        required
                      >
                        {companyTypeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    {/* GST No */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">GST No</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                        value={clientForm.gstNo}
                        onChange={e => setClientForm(f => ({ ...f, gstNo: e.target.value }))}
                        placeholder="GST Number"
                        required
                      />
                    </div>
                  </div>
                </div>
                {/* Section: Contact Info */}
                <div className="mb-4">
                  <h3 className="text-base xs:text-lg font-semibold text-blue-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 xs:w-5 h-4 xs:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4" /></svg>
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 xs:gap-x-8 gap-y-4 xs:gap-y-6 px-1 xs:px-2 sm:px-4 md:px-8">
                    {/* Email */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                        value={clientForm.email}
                        onChange={e => setClientForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="Email"
                        required
                      />
                    </div>
                    {/* Phone */}
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                        value={clientForm.phone}
                        onChange={e => setClientForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="Phone"
                        required
                      />
                    </div>
                  </div>
                </div>
                {/* Section: Address */}
                <div className="mb-4">
                  <h3 className="text-base xs:text-lg font-semibold text-blue-700 mb-2 flex items-center gap-2">
                    <svg className="w-4 xs:w-5 h-4 xs:h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243a8 8 0 1111.314 0z" /></svg>
                    Address
                  </h3>
                  <div className="flex flex-col gap-2 px-1 xs:px-2 sm:px-4 md:px-8">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 resize-none"
                      value={clientForm.address}
                      onChange={e => setClientForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="Address"
                      rows={2}
                      required
                    />
                  </div>
                </div>
                {/* Error Message */}
                {addClientError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-600 text-sm">{addClientError}</p>
                  </div>
                )}
                {/* Action Buttons */}
                <div className="flex justify-end mt-4 xs:mt-6">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-4 xs:px-6 py-2 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2 text-sm mt-2 xs:mt-3"
                    disabled={addClientLoading}
                  >
                    {addClientLoading && <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
                    {addClientLoading ? 'Adding...' : 'Add Client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Table Area (scrollable) */}
        <div
          className={`flex-grow rounded-lg bg-white shadow-lg p-0${filteredSalesData.length > 16 ? ' overflow-y-auto' : ''} mr-4 sm:mr-7 my-scrollbar`}
          style={filteredSalesData.length > 55 ? { maxHeight: '800px' } : {}}
        >
          <div className="w-full overflow-x-auto">
            {loading ? (
              <div className="p-4">Loading...</div>
            ) : error ? (
              <div className="p-4 text-red-600">Error: {error}</div>
            ) : (
              <table className="min-w-[500px] w-full text-xs xs:text-sm text-black border border-gray-400 border-collapse ">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="border bg-gradient-to-br from-blue-50 to-blue-100 px-1 xs:px-2 py-1 sm:px-3 sm:py-2 text-center">ID</th>
                    <th className="border bg-gradient-to-br from-blue-50 to-blue-100 px-1 xs:px-2 py-1 sm:px-3 sm:py-2 text-center">Client Name</th>
                    <th className="border bg-gradient-to-br from-blue-50 to-blue-100 px-1 xs:px-2 py-1 sm:px-3 sm:py-2 text-center">Total Bills</th>
                    <th className="border bg-gradient-to-br from-blue-50 to-blue-100 px-1 xs:px-2 py-1 sm:px-3 sm:py-2 text-center">Total Paid</th>
                    <th className="border bg-gradient-to-br from-blue-50 to-blue-100 px-1 xs:px-2 py-1 sm:px-3 sm:py-2 text-center">Uncleared Bills</th>
                    <th className="border bg-gradient-to-br from-blue-50 to-blue-100 px-1 xs:px-2 py-1 sm:px-3 sm:py-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalesData.map((row: any) => (
                    <tr
                      key={row.id}
                      className="bg-white hover:bg-gray-100 cursor-pointer"
                      onClick={() => navigate(`/client/${row.id}`, { state: { clientName: row.client_name || row.client } })}
                    >
                      <td className="border border-gray-400 px-1 xs:px-2 py-1 sm:px-3 sm:py-2 text-center">{row.id}</td>
                      <td className="border border-gray-400 px-1 xs:px-2 py-1 sm:px-3 sm:py-2 text-center">{(row.client_name || row.client)?.toUpperCase()}</td>
                      <td className="border border-gray-400 px-1 xs:px-2 py-1 sm:px-3 sm:py-2 text-center">{clientBills[row.id]?.total_bills === 0 ? 'No bills' : (clientBills[row.id]?.total_bills ?? '...')}</td>
                      <td className="border border-gray-400 px-1 xs:px-2 py-1 sm:px-3 sm:py-2 text-center">{clientBills[row.id]?.total_bills === 0 ? '-' : (clientBills[row.id]?.total_paid !== undefined ? `₹ ${Number(clientBills[row.id].total_paid).toLocaleString('en-IN')}` : '...')}</td>
                      <td className="border border-gray-400 px-1 xs:px-2 py-1 sm:px-3 sm:py-2 text-center">{clientBills[row.id]?.total_bills === 0 ? '-' : (clientBills[row.id]?.unpaid_bills === 0 ? 'All cleared' : (clientBills[row.id]?.unpaid_bills ?? '...'))}</td>
                      <td className="border border-gray-400 px-1 xs:px-2 py-1 sm:px-3 sm:py-2 text-center">
                        <button
                          className={`bg-white text-red-600 border border-red-400 rounded px-2 py-1 shadow-sm hover:bg-red-50 transition ${deletingId === row.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={deletingId === row.id}
                          title="Delete client"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!window.confirm('Are you sure you want to delete this client?')) return;
                            setDeletingId(row.id);
                            try {
                              const res = await fetch(`${API_BASE_URL}/api/delete-client/${row.id}`, { method: 'DELETE' });
                              if (!res.ok) throw new Error('Failed to delete');
                              setSalesData((prev: any) => prev.filter((item: any) => item.id !== row.id));
                            } catch (err: any) {
                              alert(err.message || 'Error deleting client');
                            } finally {
                              setDeletingId(null);
                            }
                          }}
                        >
                          {deletingId === row.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className='mb-4'></div>
      </div>
    </>
  );
}