import React, { useState } from 'react';

const departments = [
  'Human Resources',
  'Information Technology',
  'Finance',
  'Marketing',
  'Sales',
  'Operations',
  'Legal',
  'Customer Service'
];

const designations = [
  'Manager',
  'Senior Developer',
  'Junior Developer',
  'Team Lead',
  'Executive',
  'Analyst',
  'Coordinator',
  'Specialist',
  'Assistant',
  'Director'
];

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Consultant'
];

export default function AddEmployeePage() {
  const [formData, setFormData] = useState<{
    [key: string]: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    employeeId: string;
    department: string;
    designation: string;
    employmentType: string;
    joiningDate: string;
    reportingManager: string;
    salary: string;
    aadharCard: string;
    panCard: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    emergencyName: string;
    emergencyPhone: string;
    emergencyRelation: string;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Employment Information
    employeeId: '',
    department: '',
    designation: '',
    employmentType: '',
    joiningDate: '',
    reportingManager: '',
    salary: '',
    
    // Documents
    aadharCard: 'not-provided',
    panCard: 'not-provided',
    
    // Bank Information
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    
    // Emergency Contact
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: ''
  });

  type EmployeeType = {
    id: number;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    employeeId?: string;
    department?: string;
    designation?: string;
    employmentType?: string;
    joiningDate?: string;
    reportingManager?: string;
    salary?: string;
    aadharCard?: string;
    panCard?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    emergencyRelation?: string;
    createdAt?: string;
  };
  const [employees, setEmployees]: [EmployeeType[], React.Dispatch<React.SetStateAction<EmployeeType[]>>] = useState<EmployeeType[]>([
    { id: 1, name: 'John Doe', department: 'IT', designation: 'Manager' },
    { id: 2, name: 'Jane Smith', department: 'HR', designation: 'Executive' },
    { id: 3, name: 'Bob Brown', department: 'Finance', designation: 'Analyst' }
  ]);

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'employeeId', 'department', 'designation'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }

    const newEmployee = {
      id: editingEmployee ? editingEmployee.id : Date.now(),
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`,
      createdAt: new Date().toLocaleString()
    };

    if (editingEmployee) {
      setEmployees(employees.map(emp => emp.id === editingEmployee.id ? newEmployee : emp));
      alert('Employee updated successfully!');
    } else {
      setEmployees([...employees, newEmployee]);
      alert('Employee added successfully!');
    }

    // Reset form
    setFormData({
      firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: '',
      address: '', city: '', state: '', pincode: '', employeeId: '', department: '',
      designation: '', employmentType: '', joiningDate: '', reportingManager: '',
      salary: '', aadharCard: 'not-provided', panCard: 'not-provided',
      bankName: '', accountNumber: '', ifscCode: '', emergencyName: '',
      emergencyPhone: '', emergencyRelation: ''
    });
    setEditingEmployee(null);
    setShowForm(false);
  };

  const handleEdit = (employee: EmployeeType) => {
    // Convert all fields to string for formData
    const formCompatible: { [key: string]: string } = {};
    Object.keys(formData).forEach(key => {
      // @ts-ignore
      formCompatible[key] = (employee[key] !== undefined && employee[key] !== null) ? String(employee[key]) : '';
    });
    setFormData(formCompatible as typeof formData);
    setEditingEmployee(employee as any);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const getDocumentStatus = (status: string) => {
    switch(status) {
      case 'provided': return { label: 'Provided', color: 'bg-green-100 text-green-800' };
      case 'pending': return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      case 'not-provided': return { label: 'Not Provided', color: 'bg-red-100 text-red-800' };
      default: return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-blue-800">Employee Management</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingEmployee(null);
              setFormData({
                firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: '',
                address: '', city: '', state: '', pincode: '', employeeId: '', department: '',
                designation: '', employmentType: '', joiningDate: '', reportingManager: '',
                salary: '', aadharCard: 'not-provided', panCard: 'not-provided',
                bankName: '', accountNumber: '', ifscCode: '', emergencyName: '',
                emergencyPhone: '', emergencyRelation: ''
              });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Add New Employee
          </button>
        </div>

        {/* Modal Form Overlay */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-blue-50 rounded-3xl shadow-2xl p-12 w-full max-w-6xl max-h-[95vh] overflow-y-auto relative border-2 border-blue-200">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-3xl font-bold focus:outline-none"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
              >
                &times;
              </button>
              <h2 className="text-3xl font-bold mb-8 text-blue-800 text-center tracking-wide">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {/* Section headers and fields styled below */}
                  <div className="lg:col-span-3">
                    <h3 className="text-xl font-semibold text-blue-700 mb-4 border-b-2 border-blue-200 pb-2 bg-blue-100 rounded px-2">Personal Information</h3>
                  </div>
                  {/* Personal Info Fields */}
                  <div className="flex items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700 min-w-[140px]" style={{minWidth:140}}>First Name <span className="text-red-500">*</span></label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter first name" />
                  </div>
                  <div className="flex items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700 min-w-[140px]" style={{minWidth:140}}>Last Name <span className="text-red-500">*</span></label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter last name" />
                  </div>
                  <div className="flex items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700 min-w-[140px]" style={{minWidth:140}}>Email <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter email address" />
                  </div>
                  <div className="flex items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700 min-w-[140px]" style={{minWidth:140}}>Phone <span className="text-red-500">*</span></label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter phone number" />
                  </div>
                  <div className="flex items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700 min-w-[140px]" style={{minWidth:140}}>Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div className="flex items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700 min-w-[140px]" style={{minWidth:140}}>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex items-center mb-4 lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 min-w-[140px]" style={{minWidth:140}}>Address</label>
                    <textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter full address" />
                  </div>
                  <div className="flex items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700 min-w-[140px]" style={{minWidth:140}}>City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter city" />
                  </div>
                  <div className="flex items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700 min-w-[140px]" style={{minWidth:140}}>State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter state" />
                  </div>
                  <div className="flex items-center mb-4">
                    <label className="block text-sm font-medium text-gray-700 min-w-[140px]" style={{minWidth:140}}>Pincode</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter pincode" />
                  </div>
                  <div className="lg:col-span-3">
                    <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b-2 border-blue-200 pb-2 mt-6 bg-blue-100 rounded px-2">Employment Information</h3>
                  </div>
                  {/* Employment Info Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter employee ID"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Designation</option>
                      {designations.map(desig => (
                        <option key={desig} value={desig}>{desig}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employment Type
                    </label>
                    <select
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Type</option>
                      {employmentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={formData.joiningDate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reporting Manager
                    </label>
                    <input
                      type="text"
                      name="reportingManager"
                      value={formData.reportingManager}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter reporting manager"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salary
                    </label>
                    <input
                      type="number"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter salary"
                    />
                  </div>

                  {/* Documents Section */}
                  <div className="lg:col-span-3">
                    <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b pb-2 mt-6">Documents</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhar Card Status
                    </label>
                    <select
                      name="aadharCard"
                      value={formData.aadharCard}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="not-provided">Not Provided</option>
                      <option value="pending">Pending</option>
                      <option value="provided">Provided</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Card Status
                    </label>
                    <select
                      name="panCard"
                      value={formData.panCard}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="not-provided">Not Provided</option>
                      <option value="pending">Pending</option>
                      <option value="provided">Provided</option>
                    </select>
                  </div>

                  {/* Bank Information Section */}
                  <div className="lg:col-span-3">
                    <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b pb-2 mt-6">Bank Information</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter bank name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter account number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter IFSC code"
                    />
                  </div>

                  {/* Emergency Contact Section */}
                  <div className="lg:col-span-3">
                    <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b pb-2 mt-6">Emergency Contact</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      name="emergencyName"
                      value={formData.emergencyName}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter emergency contact name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter emergency contact phone"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship
                    </label>
                    <select
                      name="emergencyRelation"
                      value={formData.emergencyRelation}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Relationship</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Friend">Friend</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                {/* Form Actions */}
                <div className="flex justify-end gap-4 mt-12">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-8 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-8 rounded-lg shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  >
                    {editingEmployee ? 'Update Employee' : 'Add Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Employee List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-bold mb-6 text-blue-800">Employee List</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(employees as EmployeeType[]).map((employee: EmployeeType) => (
              <div key={employee.id} className="border border-blue-100 rounded-xl p-6 bg-blue-50 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-blue-900">{employee.name || `${employee.firstName ?? ''} ${employee.lastName ?? ''}`}</h3>
                    <p className="text-sm text-blue-700">{employee.designation ?? ''}</p>
                    <p className="text-sm text-blue-700">{employee.department ?? ''}</p>
                    {employee.employeeId && <p className="text-sm text-blue-700">ID: {employee.employeeId}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {/* Document Status */}
                {(employee.aadharCard || employee.panCard) && (
                  <div className="mt-3 space-y-1">
                    {employee.aadharCard && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Aadhar:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getDocumentStatus(employee.aadharCard).color}`}>
                          {getDocumentStatus(employee.aadharCard).label}
                        </span>
                      </div>
                    )}
                    {employee.panCard && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">PAN:</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getDocumentStatus(employee.panCard).color}`}>
                          {getDocumentStatus(employee.panCard).label}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}