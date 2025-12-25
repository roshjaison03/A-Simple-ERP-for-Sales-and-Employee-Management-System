import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaCalendarAlt, FaFileInvoice, FaBuilding, FaTrash, FaUserCircle } from 'react-icons/fa';

function JobCell({ job_name }: { job_name: string }) {
  return (
    <div className="text-center" style={{ minWidth: 180, maxWidth: 400, margin: '0 auto' }}>
      {job_name}
    </div>
  );
}

export default function ClientDetailsPage() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // Job type definition
  interface JobItem {
    name: string;
    price: string;
  }

  const { clientId } = useParams();
  const location = useLocation();
  const [client, setClient] = useState<any>(null);
  const [loadingClient, setLoadingClient] = useState(true);
  const [clientError, setClientError] = useState<string | null>(null);
  const clientName = location.state?.clientName || '';
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  // Add Bill Modal State
  const [addBillForm, setAddBillForm] = useState({
    bill_no: '',
    date_billed: '',
    payment_status: 'Unpaid',
    jobs: [{ name: '', price: '' }],
  });

  // Calculate total amount whenever jobs change
  const totalAmount = addBillForm.jobs.reduce((sum, job) => {
    const price = parseFloat(job.price) || 0;
    return sum + price;
  }, 0);

  // Handle job field changes
  const handleJobChange = (index: number, field: 'name' | 'price', value: string) => {
    const updatedJobs = [...addBillForm.jobs];
    updatedJobs[index] = { ...updatedJobs[index], [field]: value };
    setAddBillForm({ ...addBillForm, jobs: updatedJobs });
  };

  // Add a new job row
  const addJobRow = () => {
    setAddBillForm({
      ...addBillForm,
      jobs: [...addBillForm.jobs, { name: '', price: '' }],
    });
  };

  // Remove a job row
  const removeJobRow = (index: number) => {
    if (addBillForm.jobs.length <= 1) return;
    const updatedJobs = addBillForm.jobs.filter((_, i) => i !== index);
    setAddBillForm({ ...addBillForm, jobs: updatedJobs });
  };
  const [addBillLoading, setAddBillLoading] = useState(false);
  const [addBillError, setAddBillError] = useState<string | null>(null);
  const [deleteBillId, setDeleteBillId] = useState<number | null>(null);
  const [totalBills, setTotalBills] = useState<number | null>(null);
  const [totalUncleared, setTotalUncleared] = useState<number | null>(null);
  const [showEditFields, setShowEditFields] = useState(false);
  const [editChecks, setEditChecks] = useState({
    client_name: false,
    address: false,
    email: false,
    phone_no: false,
    gst_no: false,
    company_type: false,
    joined_date: false,
  });
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormValues, setEditFormValues] = useState({
    client_name: '',
    address: '',
    email: '',
    phone_no: '',
    gst_no: '',
    company_type: '',
    joined_date: '',
  });
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [showClientOverlay, setShowClientOverlay] = useState(false);

  // Helper: Get years from 2020 to current
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = 2020; y <= currentYear; y++) years.push(y);
    return years;
  };

  // Filtered bills by year
  const filteredBills = selectedYear === 'All'
    ? bills
    : bills.filter(bill => {
        if (!bill.date_billed) return false;
        const year = new Date(bill.date_billed).getFullYear();
        return year === Number(selectedYear);
      });

  const editKeys = [
    'client_name',
    'address',
    'email',
    'phone_no',
    'gst_no',
    'company_type',
    'joined_date',
  ] as const;

  // Helper to refresh client bills summary
  const refreshClientBillsSummary = (clientId: string | undefined) => {
    if (!clientId) return;
    fetch(`${API_BASE_URL}/api/clientbills/${clientId}`)
      .then(res => res.json())
      .then(data => {
        if (typeof data.total_bills === 'number') setTotalBills(data.total_bills);
        if (typeof data.unpaid_bills === 'number') setTotalUncleared(data.unpaid_bills);
      });
  };

  // Fetch client data on component mount
  useEffect(() => {
    if (clientId) {
      setLoadingClient(true);
      setClientError(null);
      fetch(`${API_BASE_URL}/api/clientdata/${clientId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch client data');
          return res.json();
        })
        .then(data => {
          setClient(data);
        })
        .catch(err => {
          setClientError(err.message || 'Error fetching client data');
        })
        .finally(() => {
          setLoadingClient(false);
        });
    }
  }, [clientId]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/bills?sales_id=${clientId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch bills');
        return res.json();
      })
      .then(billsData => {
        setBills(Array.isArray(billsData) ? billsData : []);
        setLoading(false);
        refreshClientBillsSummary(clientId);
      })
      .catch(err => {
        setError(err.message);
        setBills([]);
        setLoading(false);
      });
  }, [clientId]);

  // Fetch total bills for this client
  useEffect(() => {
    if (clientId) {
      fetch(`${API_BASE_URL}/api/clientbills/${clientId}`)
        .then(res => res.json())
        .then(data => {
          if (typeof data.total_bills === 'number') setTotalBills(data.total_bills);
          if (typeof data.unpaid_bills === 'number') setTotalUncleared(data.unpaid_bills);
        });
    }
  }, [clientId]);

  // Add Bill Submit
  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddBillError(null);
    
    // Validate at least one job has both name and price
    if (!addBillForm.jobs.some((job: JobItem) => job.name.trim() && job.price)) {
      setAddBillError('Please add at least one job with name and price');
      return;
    }
    
    setAddBillLoading(true);
    try {
      const res = await fetch('${API_BASE_URL}/api/add-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addBillForm,
          total_amount: totalAmount,
          sales_id: clientId,
          job_details: addBillForm.jobs,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add bill');
      setShowModal(false);
      setAddBillForm({ 
        bill_no: '', 
        date_billed: '', 
        payment_status: 'Unpaid', 
        jobs: [{ name: '', price: '' }] 
      });
      // Refresh bills
      setLoading(true);
      fetch(`${API_BASE_URL}/api/bills?sales_id=${clientId}`)
        .then(res => res.json())
        .then(billsData => {
          setBills(Array.isArray(billsData) ? billsData : []);
          // Refresh client bills summary after bills are updated
          refreshClientBillsSummary(clientId);
        })
        .finally(() => setLoading(false));
    } catch (err: any) {
      setAddBillError(err.message || 'Error adding bill');
    } finally {
      setAddBillLoading(false);
    }
  };

  // Delete Bill
  const handleDeleteBill = async (billId: number) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    setDeleteBillId(billId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/delete-bill/${billId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete bill');
      setBills(prev => {
        const updated = prev.filter(b => b.id !== billId);
        // Refresh client bills summary after bills are updated
        refreshClientBillsSummary(clientId);
        return updated;
      });
    } catch (err: any) {
      alert(err.message || 'Error deleting bill');
    } finally {
      setDeleteBillId(null);
    }
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Function to handle payment status change
  const handlePaymentStatusChange = async (billId: number, newStatus: string) => {
    try {
      const bill = bills.find(b => b.id === billId);
      if (!bill) throw new Error('Bill not found');
      const billNo = bill.bill_no;
      const res = await fetch(`${API_BASE_URL}/api/bills/${billNo}/payment-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update payment status');
      setBills(prev => prev.map(bill => 
        bill.id === billId ? { ...bill, payment_status: newStatus } : bill
      ));
      // Refresh client bills summary after payment status change
      refreshClientBillsSummary(clientId);
    } catch (err: any) {
      alert(err.message || 'Error updating payment status');
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!bills) return <div className="p-4">No bills found.</div>;

  return (
    <div className="w-full relative min-h-screen overflow-y-auto sm:flex sm:flex-col sm:h-screen sm:overflow-hidden">
      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative animate-fade-in">
            {/* Header */}
            <div className="mb-8 flex flex-col items-center">
              <h2 className="text-3xl font-extrabold text-blue-800 mb-2 flex items-center gap-2">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add New Bill
              </h2>
              <div className="w-16 h-1 bg-blue-500 rounded-full" />
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors p-1 rounded-full bg-white"
                style={{ background: 'white' }}
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="space-y-0" onSubmit={handleAddBill}>
            <div className="max-w-4xl mx-auto bg-gradient-to-br from-white to-gray-50 shadow-xl rounded-2xl p-8 sm:p-10 space-y-10 border border-gray-100">

{/* Heading */}
<div className="flex items-center gap-3 pb-2 border-b border-gray-200">
  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2" />
    </svg>
  </div>
  <div>
    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
      Bill Information
    </h2>
    <p className="text-sm text-gray-500 mt-1">Create and manage your billing details</p>
  </div>
</div>

{/* Bill Details */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
  {/* Bill No */}
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      Bill No
    </label>
    <input
      type="text"
      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 shadow-sm"
      value={addBillForm.bill_no}
      onChange={e => setAddBillForm(f => ({ ...f, bill_no: e.target.value }))}
      placeholder="Enter bill number"
      required
    />
  </div>

  {/* Date Billed */}
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      Date Billed
    </label>
    <input
      type="date"
      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 shadow-sm"
      value={addBillForm.date_billed}
      onChange={e => setAddBillForm(f => ({ ...f, date_billed: e.target.value }))}
      required
    />
  </div>

  {/* Payment Status */}
  <div className="space-y-2 sm:col-span-2">
    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
      Payment Status
    </label>
    <select
      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 shadow-sm appearance-none cursor-pointer"
      value={addBillForm.payment_status}
      onChange={e => setAddBillForm(f => ({ ...f, payment_status: e.target.value }))}
      required
    >
      <option value="Paid">✅ Paid</option>
      <option value="Unpaid">⏳ Unpaid</option>
    </select>
  </div>
</div>

{/* Job Entries */}
<div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800">Job Details</h3>
      </div>
      <button
        type="button"
        onClick={addJobRow}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Job
      </button>
    </div>
  </div>

  <div className="p-6 space-y-6">
    {addBillForm.jobs.map((job, index) => (
      <div key={index} className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end">
          {/* Job Name */}
          <div className="sm:col-span-6 space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Job Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 shadow-sm"
              value={job.name}
              onChange={(e) => handleJobChange(index, 'name', e.target.value)}
              placeholder="E.g., Website Development"
              required
            />
          </div>

          {/* Job Price */}
          <div className="sm:col-span-4 space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Price (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
              <input
                type="number"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-300 shadow-sm"
                value={job.price}
                onChange={(e) => handleJobChange(index, 'price', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Remove Button */}
          <div className="sm:col-span-2 flex items-center justify-center pt-6">
            {addBillForm.jobs.length > 1 && (
              <button
                type="button"
                onClick={() => removeJobRow(index)}
                className="group p-3 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-200 border-2 border-red-200 hover:border-red-500 shadow-sm hover:shadow-lg transform hover:scale-105"
                title="Remove Job"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    ))}

    {/* Total */}
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mt-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-800">Total Amount</span>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ₹{totalAmount.toFixed(2)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {addBillForm.jobs.length} job{addBillForm.jobs.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Error Message */}
{addBillError && (
  <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-400 p-4 rounded-xl shadow-lg">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-red-100 rounded-full">
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9h2v4h-2V9zm0-4h2v2h-2V5z" clipRule="evenodd" />
        </svg>
      </div>
      <div>
        <h4 className="font-semibold text-red-800">Error</h4>
        <p className="text-red-700 text-sm mt-1">{addBillError}</p>
      </div>
    </div>
  </div>
)}

{/* Submit */}
<div className="pt-6 flex justify-end border-t border-gray-200">
  <button
    type="submit"
    disabled={addBillLoading}
    className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-xl font-semibold text-sm flex items-center gap-3 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 disabled:transform-none disabled:hover:shadow-xl"
  >
    {addBillLoading ? (
      <>
        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span>Adding Bill...</span>
      </>
    ) : (
      <>
        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Add Bill</span>
      </>
    )}
    
    {/* Shine effect */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-all duration-700 rounded-xl"></div>
  </button>
</div>
</div>
            </form>
          </div>
        </div>
      )}

      {/* Client Details Overlay (Mobile) */}
      {showClientOverlay && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-blue-900">Client Details</h2>
            <button
              className="text-gray-500 hover:text-black text-2xl"
              onClick={() => setShowClientOverlay(false)}
              aria-label="Close overlay"
            >
              &times;
            </button>
          </div>
          <div className="p-6 space-y-4">
            {client && !loadingClient && !clientError && (
              <>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-black text-xl font-bold">
                    <span>Client Name:</span>
                    <span className="font-extrabold">{(clientName || client?.client_name || clientId)?.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-black"><FaMapMarkerAlt className="text-gray-500" /><span className="font-semibold">Address:</span> {client.address}</div>
                  <div className="flex items-center gap-2 text-black"><FaEnvelope className="text-gray-500" /><span className="font-semibold">Email:</span> {client.email}</div>
                  <div className="flex items-center gap-2 text-black"><FaPhoneAlt className="text-gray-500" /><span className="font-semibold">Phone:</span> {client.phone_no}</div>
                  <div className="flex items-center gap-2 text-black"><FaFileInvoice className="text-gray-500" /><span className="font-semibold">GST NO:</span> {client.gst_no}</div>
                  <div className="flex items-center gap-2 text-black"><FaBuilding className="text-gray-500" /><span className="font-semibold">Company Type:</span> {client.company_type}</div>
                  <div className="flex items-center gap-2 text-black"><FaCalendarAlt className="text-gray-500" /><span className="font-semibold">Joined:</span> {formatDate(client.joined_date)}</div>
                </div>
              </>
            )}
            {loadingClient && <div className="text-black">Loading client details...</div>}
            {clientError && <div className="text-red-600">{clientError}</div>}
          </div>
        </div>
      )}
      {/* Header Section */}
      <div className="mb-6 bg-white bg-opacity-95 backdrop-blur-sm shadow-sm sm:sticky sm:top-0 sm:z-20">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-4">
          {/* Mobile: Show only icon, open overlay on click */}
          <div className="sm:hidden flex items-center justify-start p-4">
            <button
              className="bg-white text-blue-700 text-4xl rounded-full shadow-md p-2 focus:outline-none border border-blue-200"
              onClick={() => setShowClientOverlay(true)}
              aria-label="Show client details"
            >
              <FaUserCircle />
            </button>
            <span className="ml-3 font-bold text-lg">Client Details</span>
          </div>
          {/* Desktop: Show full client info card */}
          <div className="hidden sm:flex bg-gray-50 border border-gray-200 rounded-lg p-5 flex-col sm:flex-row gap-6 shadow-sm max-w-3xl w-full">
            {loadingClient && <div className="text-black">Loading client details...</div>}
            {clientError && <div className="text-red-600">{clientError}</div>}
            {client && !loadingClient && !clientError && (
              <>
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-2 text-black text-xl font-bold">
                    <span>Client Name:</span>
                    <span className="font-extrabold">{(clientName || client?.client_name || clientId)?.toUpperCase()}</span>
                    {typeof totalBills === 'number' && (
                      <span className="ml-2 text-base font-semibold text-blue-700">(Total Bills: {totalBills})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-black"><FaMapMarkerAlt className="text-gray-500" /><span className="font-semibold">Address:</span> {client.address}</div>
                  <div className="flex items-center gap-2 text-black"><FaEnvelope className="text-gray-500" /><span className="font-semibold">Email:</span> {client.email}</div>
                  <div className="flex items-center gap-2 text-black"><FaPhoneAlt className="text-gray-500" /><span className="font-semibold">Phone:</span> {client.phone_no}</div>
                </div>
                <div className="flex flex-col gap-3 flex-1 relative">
                  <div className="flex items-center gap-2 text-black"><FaFileInvoice className="text-gray-500" /><span className="font-semibold">GST NO:</span> {client.gst_no}</div>
                  <div className="flex items-center gap-2 text-black"><FaBuilding className="text-gray-500" /><span className="font-semibold">Company Type:</span> {client.company_type}</div>
                  <div className="flex items-center gap-2 text-black"><FaCalendarAlt className="text-gray-500" /><span className="font-semibold">Joined:</span> {formatDate(client.joined_date)}</div>
                  <button
                    className="absolute bottom-0 right-0 flex items-center gap-2 bg-blue-600 text-white border-none px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ margin: '0.5rem' }}
                    onClick={() => setShowEditFields(v => !v)}
                    title="Edit client details"
                  >
                    <FaFileInvoice className="text-base" />
                    Edit
                  </button>
                </div>
              </>
            )}
          </div>
          {/* Summary Section: Total Bills, Collective Amount, Remaining to Pay */}
          <div className="flex flex-wrap gap-6 items-center justify-center my-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-3 flex flex-col items-center min-w-[150px]">
              <span className="text-sm text-blue-700 font-semibold">Total Bills</span>
              <span className="text-2xl font-bold text-blue-900">
                {totalBills === 0 ? 'No bills' : (totalBills !== null ? totalBills : '...')}
              </span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg px-6 py-3 flex flex-col items-center min-w-[150px]">
              <span className="text-sm text-green-700 font-semibold">Collective Amount</span>
              <span className="text-2xl font-bold text-green-900">
                {totalBills === 0 ? '-' : (bills.reduce((sum, bill) => sum + (Number(bill.total_amount) || 0), 0).toLocaleString('en-IN'))}
              </span>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-6 py-3 flex flex-col items-center min-w-[150px]">
              <span className="text-sm text-yellow-700 font-semibold">Uncleared Bills</span>
              <span className="text-2xl font-bold text-yellow-900">
                {totalBills === 0 ? '-' : (totalUncleared === 0 ? 'All cleared' : (totalUncleared !== null ? totalUncleared : '...'))}
              </span>
            </div>
          </div>
          {/* Year Filter Dropdown directly below summary */}
          <div className="flex items-center gap-2 mb-4 justify-center">
            <label htmlFor="year-filter" className="font-semibold text-black">Filter by Year:</label>
            <select
              id="year-filter"
              className="border border-gray-300 rounded px-3 py-2 text-black bg-white focus:ring-2 focus:ring-blue-400"
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
            >
              <option value="All">All Years</option>
              {getYearOptions().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <button
  className="mt-6 mr-4 flex items-center gap-2 bg-blue-600 text-white border-none px-5 py-5 rounded-lg text-base font-semibold shadow hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
  onClick={() => setShowModal(true)}
>
  <FaFileInvoice className="text-lg" />
  Add Bills
</button>

        </div>
      </div>

      {/* Edit Fields Modal Overlay */}
      {showEditFields && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xl transform transition-all duration-300 ease-out relative">
            <div className="mb-6 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Edit Client Details</h2>
              <div className="w-16 h-1 bg-blue-500 rounded-full" />
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors p-1 rounded-full bg-white"
                style={{ background: 'white' }}
                onClick={() => { setShowEditFields(false); setShowEditForm(false); }}
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {!showEditForm ? (
              <>
                <div className="font-semibold mb-4 text-black">Select fields to edit:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <label className="flex items-center gap-2 bg-white text-black p-2 rounded">
                    <input type="checkbox" checked={editChecks.client_name} onChange={e => setEditChecks(c => ({ ...c, client_name: e.target.checked }))} />
                    Client Name
                  </label>
                  <label className="flex items-center gap-2 bg-white text-black p-2 rounded">
                    <input type="checkbox" checked={editChecks.address} onChange={e => setEditChecks(c => ({ ...c, address: e.target.checked }))} />
                    Address
                  </label>
                  <label className="flex items-center gap-2 bg-white text-black p-2 rounded">
                    <input type="checkbox" checked={editChecks.email} onChange={e => setEditChecks(c => ({ ...c, email: e.target.checked }))} />
                    Email
                  </label>
                  <label className="flex items-center gap-2 bg-white text-black p-2 rounded">
                    <input type="checkbox" checked={editChecks.phone_no} onChange={e => setEditChecks(c => ({ ...c, phone_no: e.target.checked }))} />
                    Phone
                  </label>
                  <label className="flex items-center gap-2 bg-white text-black p-2 rounded">
                    <input type="checkbox" checked={editChecks.gst_no} onChange={e => setEditChecks(c => ({ ...c, gst_no: e.target.checked }))} />
                    GST NO
                  </label>
                  <label className="flex items-center gap-2 bg-white text-black p-2 rounded">
                    <input type="checkbox" checked={editChecks.company_type} onChange={e => setEditChecks(c => ({ ...c, company_type: e.target.checked }))} />
                    Company Type
                  </label>
                  <label className="flex items-center gap-2 bg-white text-black p-2 rounded">
                    <input type="checkbox" checked={editChecks.joined_date} onChange={e => setEditChecks(c => ({ ...c, joined_date: e.target.checked }))} />
                    Joined Date
                  </label>
                </div>
                <button
                  className={`w-full mt-2 py-2 rounded-lg font-semibold text-white transition-colors ${Object.values(editChecks).some(Boolean) ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
                  disabled={!Object.values(editChecks).some(Boolean)}
                  onClick={() => {
                    setEditFormValues({
                      client_name: client?.client_name || '',
                      address: client?.address || '',
                      email: client?.email || '',
                      phone_no: client?.phone_no || '',
                      gst_no: client?.gst_no || '',
                      company_type: client?.company_type || '',
                      joined_date: client?.joined_date ? client.joined_date.slice(0,10) : '',
                    });
                    setShowEditForm(true);
                  }}
                >
                  Modify
                </button>
              </>
            ) : (
              <form className="flex flex-col gap-4 text-blue-900" onSubmit={async e => {
                e.preventDefault();
                // Prepare only changed fields
                const changedFields: any = {};
                editKeys.forEach(key => {
                  if (editChecks[key] && editFormValues[key] !== (client?.[key] || '')) {
                    changedFields[key] = editFormValues[key];
                  }
                });
                if (Object.keys(changedFields).length === 0) {
                  alert('No changes to save.');
                  return;
                }
                try {
                  const res = await fetch(`${API_BASE_URL}/api/clients/${clientId}/edit`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(changedFields),
                  });
                  if (!res.ok) throw new Error('Failed to update client info');
                  setShowEditForm(false);
                  setShowEditFields(false);
                  // Refresh client data
                  fetch(`${API_BASE_URL}/api/clientdata/${clientId}`)
                    .then(res => res.json())
                    .then(data => setClient(data));
                } catch (err: any) {
                  alert(err.message || 'Error updating client info');
                }
              }}>
                {editChecks.client_name && (
                  <div>
                    <label className="block mb-1 font-semibold bg-white text-black p-1 rounded">Client Name</label>
                    <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2" value={editFormValues.client_name} onChange={e => setEditFormValues(f => ({ ...f, client_name: e.target.value }))} />
                  </div>
                )}
                {editChecks.address && (
                  <div>
                    <label className="block mb-1 font-semibold bg-white text-black p-1 rounded">Address</label>
                    <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2" value={editFormValues.address} onChange={e => setEditFormValues(f => ({ ...f, address: e.target.value }))} />
                  </div>
                )}
                {editChecks.email && (
                  <div>
                    <label className="block mb-1 font-semibold bg-white text-black p-1 rounded">Email</label>
                    <input type="email" className="w-full border border-gray-300 rounded-md px-3 py-2" value={editFormValues.email} onChange={e => setEditFormValues(f => ({ ...f, email: e.target.value }))} />
                  </div>
                )}
                {editChecks.phone_no && (
                  <div>
                    <label className="block mb-1 font-semibold bg-white text-black p-1 rounded">Phone</label>
                    <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2" value={editFormValues.phone_no} onChange={e => setEditFormValues(f => ({ ...f, phone_no: e.target.value }))} />
                  </div>
                )}
                {editChecks.gst_no && (
                  <div>
                    <label className="block mb-1 font-semibold bg-white text-black p-1 rounded">GST NO</label>
                    <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2" value={editFormValues.gst_no} onChange={e => setEditFormValues(f => ({ ...f, gst_no: e.target.value }))} />
                  </div>
                )}
                {editChecks.company_type && (
                  <div>
                    <label className="block mb-1 font-semibold bg-white text-black p-1 rounded">Company Type</label>
                    <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2" value={editFormValues.company_type} onChange={e => setEditFormValues(f => ({ ...f, company_type: e.target.value }))} />
                  </div>
                )}
                {editChecks.joined_date && (
                  <div>
                    <label className="block mb-1 font-semibold bg-white text-black p-1 rounded">Joined Date</label>
                    <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2" value={editFormValues.joined_date} onChange={e => setEditFormValues(f => ({ ...f, joined_date: e.target.value }))} />
                  </div>
                )}
                <div className="flex gap-4 mt-4">
                  <button type="button" className="flex-1 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition" onClick={() => setShowEditForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition">
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Bills Table */}
      <div className="rounded-lg border bg-white shadow-lg p-2 sm:flex-grow sm:min-h-0 sm:overflow-y-auto">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[900px] w-full text-base text-black border border-gray-400 border-collapse">
          <thead className="bg-slate-200">
            <tr>
              <th className="w-8"></th>
              <th className="border border-gray-400 px-4 py-3 text-center">Bill No</th>
              <th className="border border-gray-400 px-4 py-3 text-center">Date Billed</th>
              <th className="border border-gray-400 px-4 py-3 text-center">Total Amount</th>
              <th className="border border-gray-400 px-4 py-3 text-center">Job Name</th>
              <th className="border border-gray-400 px-4 py-3 text-center">Payment Status</th>
              <th className="border border-gray-400 px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.length === 0 ? (
              <tr>
                <td colSpan={7} className="border border-gray-400 px-4 py-6 text-center text-gray-500">No data</td>
              </tr>
            ) : (
              filteredBills.map((bill, idx) => {
                const isUnpaid = (bill.payment_status || '').toLowerCase() === 'unpaid';
                return (
                  <tr
                    key={bill.id || idx}
                    className="bg-white hover:bg-gray-100"
                  >
                    {/* Red dot for unpaid */}
                    <td className="align-middle text-center">
                      {isUnpaid && (
                        <span
                          className="inline-block w-3 h-3 rounded-full bg-red-500"
                          title="Unpaid"
                        />
                      )}
                    </td>
                    {/* Bill No */}
                    <td className="border border-gray-400 px-4 py-3 text-center">{bill.bill_no}</td>
                    {/* Date Billed */}
                    <td className="border border-gray-400 px-4 py-3 text-center">
                      {formatDate(bill.date_billed)}
                    </td>
                    {/* Total Amount */}
                    <td className="border border-gray-400 px-4 py-3 text-center">
                      ₹ {Number(bill.total_amount).toLocaleString('en-IN')}
                    </td>
                    {/* Job Name */}
                    <td className="border border-gray-400 px-4 py-3 text-center">
                      <JobCell job_name={bill.job_name} />
                    </td>
                    {/* Payment Status */}
                    <td className="border border-gray-400 px-4 py-3 text-center">
                      <select
                        className="border border-gray-400 rounded px-3 py-2 text-center bg-white text-black shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        value={bill.payment_status || 'Unpaid'}
                        onChange={(e) => handlePaymentStatusChange(bill.id, e.target.value)}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                      </select>
                    </td>
                    {/* Actions */}
                    <td className="border border-gray-400 px-4 py-3 text-center">
                      <div className="flex justify-center">
                        <button
                          className={`bg-white text-red-600 border border-red-400 rounded px-2 py-1 shadow-sm hover:bg-red-50 transition ${deleteBillId === bill.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={deleteBillId === bill.id}
                          title="Delete bill"
                          onClick={() => handleDeleteBill(bill.id)}
                        >
                          {deleteBillId === bill.id ? 'Deleting...' : <FaTrash />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}