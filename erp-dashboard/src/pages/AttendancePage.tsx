import React, { useState, useEffect } from 'react';

// Remove hardcoded employees
// const employees = [ ... ];

const attendanceOptions = [
  { value: 'present', label: 'Present', color: 'bg-green-100 text-green-800', eventColor: 'bg-green-500' },
  { value: 'absent', label: 'Absent', color: 'bg-red-100 text-red-800', eventColor: 'bg-red-500' },
  { value: 'sick-leave', label: 'Sick Leave', color: 'bg-yellow-100 text-yellow-800', eventColor: 'bg-yellow-500' },
  { value: 'casual-leave', label: 'Casual Leave', color: 'bg-blue-100 text-blue-800', eventColor: 'bg-blue-500' },
  { value: 'overtime', label: 'Overtime', color: 'bg-purple-100 text-purple-800', eventColor: 'bg-purple-500' },
  { value: 'half-day', label: 'Half Day', color: 'bg-orange-100 text-orange-800', eventColor: 'bg-orange-500' },
  { value: 'holiday', label: 'Holiday', color: 'bg-gray-100 text-gray-800', eventColor: 'bg-gray-500' }
];

export default function AttendanceRecordPage() {
  // Employees from backend
  const [employees, setEmployees] = useState<{id: number, Fullname: string}[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatus, setAttendanceStatus] = useState('present');
  const [workingHours, setWorkingHours] = useState('8');
  const [overtimeHours, setOvertimeHours] = useState('0');
  const [notes, setNotes] = useState('');
  type AttendanceRecord = {
    id: number;
    employee: string;
    date: string;
    status: string;
    workingHours: string;
    overtimeHours: string;
    notes: string;
    timestamp: string;
    employee_id?: number;
    employeeShort?: string; // Add this line
  };
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [employee, setEmployee] = useState<string | null>(null); // NEW: for short name
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch employees on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/employees`)
      .then(res => res.json())
      .then(data => {
        setEmployees(data);
        if (data.length > 0) {
          setSelectedEmployee(data[0].Fullname);
          setSelectedEmployeeId(data[0].id);
        }
      });
  }, []);


  useEffect(() => {
    if (selectedEmployeeId) {
      fetch(`${API_BASE_URL}/api/employee_attendance?id=${selectedEmployeeId}`)
        .then(res => res.json())
        .then(data => {
          const emp = employees.find(e => e.id === selectedEmployeeId);
          const mapped = Array.isArray(data)
            ? data.map(r => {
                // Convert date from DD-MM-YYYY to YYYY-MM-DD if needed
                let date = r.date;
                if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
                  const [dd, mm, yyyy] = date.split('-');
                  date = `${yyyy}-${mm}-${dd}`;
                }
                return {
                  ...r,
                  employeeShort: emp?.Fullname.split(' ')[0] || '' // NEW: short name for calendar
                };
              })
            : [];
          setRecords(mapped);
        });
    } else {
      setRecords([]);
    }
  }, [selectedEmployeeId, employees]);

  const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const empId = Number(e.target.value);
    const emp = employees.find(emp => emp.id === empId);
    setSelectedEmployee(emp ? emp.Fullname : null);
    setSelectedEmployeeId(empId);
    setEmployee(emp ? emp.Fullname.split(' ')[0] : null); // NEW: set short name
  };

  const handleSubmit = async () => {
    if (!selectedEmployeeId) return;
    const attendancePayload = {
      employee: selectedEmployee,
      date: selectedDate,
      status: attendanceStatus,
      workingHours: workingHours,
      overtimeHours: overtimeHours,
      notes: notes,
      timestamp: new Date().toLocaleString(),
      employee_id: selectedEmployeeId
    };
    await fetch(`${API_BASE_URL}/api/attendance_save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attendancePayload),
    });
    // Refresh attendance data
    fetch(`${API_BASE_URL}/api/employee_attendance?id=${selectedEmployeeId}`)
      .then(res => res.json())
      .then(data => {
        const emp = employees.find(e => e.id === selectedEmployeeId);
        setRecords(Array.isArray(data) ? data.map(r => ({ ...r, employee: emp?.Fullname || '' })) : []);
      });
    // Reset form
    setWorkingHours('8');
    setOvertimeHours('0');
    setNotes('');
    alert('Attendance record saved successfully!');
  };

  const getStatusColor = (status: string) => {
    const option = attendanceOptions.find(opt => opt.value === status);
    return option ? option.color : 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const option = attendanceOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  };

  const getEventColor = (status: string) => {
    const option = attendanceOptions.find(opt => opt.value === status);
    return option ? option.eventColor : 'bg-gray-500';
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getRecordsForDate = (date: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    return records.filter(record => record.date === dateStr);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const today = new Date();
  const isToday = (date: number) => {
    return today.getDate() === date && 
           today.getMonth() === currentMonth && 
           today.getFullYear() === currentYear;
  };

  const handleDateClick = (date: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      <div className="flex-1 flex flex-col lg:flex-row w-full h-full gap-0">
        {/* Calendar Section - Left (70%) */}
        <div className="lg:w-[70%] w-full bg-white rounded-none lg:rounded-l-2xl shadow-xl p-6 flex flex-col min-h-0 justify-center transition-all duration-300">
          <div className="max-w-7xl w-full mx-auto">
            {/* Calendar Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-t-xl shadow-md px-4 py-4 flex items-center justify-between mb-4 border-b border-blue-200">
              {/* Left: Employee Dropdown */}
              <div className="flex items-center">
                <label className="mr-2 font-semibold text-blue-700" htmlFor="calendar-employee-filter">Employee:</label>
                <select
                  id="calendar-employee-filter"
                  className="border border-blue-300 rounded-md px-3 py-2 text-base bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                  value={selectedEmployeeId ?? ''}
                  onChange={handleEmployeeChange}
                  style={{ minWidth: 180 }}
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.Fullname}</option>
                  ))}
                </select>
              </div>
              {/* Center: Month/Year */}
              <h2 className="text-2xl font-bold text-blue-700 tracking-wide">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              {/* Right: Navigation Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="px-3 py-1 bg-white hover:bg-blue-200 rounded-full text-blue-700 font-bold shadow transition"
                  aria-label="Previous Month"
                >
                  ◀
                </button>
                <button
                  onClick={() => {
                    setCurrentMonth(today.getMonth());
                    setCurrentYear(today.getFullYear());
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-full text-white font-bold shadow transition"
                  aria-label="Go to Today"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="px-3 py-1 bg-white hover:bg-blue-200 rounded-full text-blue-700 font-bold shadow transition"
                  aria-label="Next Month"
                >
                  ▶
                </button>
              </div>
            </div>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 bg-white rounded-b-xl shadow-inner p-4 border border-blue-100">
              {/* Day Headers */}
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-base font-semibold text-blue-500 bg-blue-50 rounded">
                  {day}
                </div>
              ))}
              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDay }).map((_, index) => (
                <div key={`empty-${index}`} className="h-20"></div>
              ))}
              {/* Calendar days */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const date = index + 1;
                // Filter records for the selected employee if not 'All Employees'
                const dayRecords = (selectedEmployeeId ? getRecordsForDate(date) : getRecordsForDate(date).filter(r => r.employee_id === selectedEmployeeId));
                const isSelectedDate = selectedDate === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                return (
                  <div
                    key={date}
                    onClick={() => handleDateClick(date)}
                    className={`h-20 flex flex-col items-center justify-start border border-blue-100 p-1 cursor-pointer transition-all duration-150 select-none
                      ${isToday(date) ? 'bg-blue-100 border-blue-400 shadow-md' : 'bg-white'}
                      ${isSelectedDate ? 'ring-4 ring-blue-400 border-blue-500 z-10' : ''}
                      rounded-lg hover:bg-blue-50 group`}
                  >
                    <div className={`text-lg font-bold mb-1 ${isToday(date) ? 'text-blue-700' : 'text-gray-900'} group-hover:text-blue-600`}>{date}</div>
                    <div className="flex flex-col gap-1 w-full items-center">
                      {dayRecords.slice(0, 2).map(record => (
                        <span
                          key={record.id}
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold truncate shadow-sm ${getEventColor(record.status)}`}
                          title={`${record.employeeShort} - ${getStatusLabel(record.status)}`}
                        >
                          {record.employeeShort} - {getStatusLabel(record.status)}
                        </span>
                      ))}
                      {dayRecords.length > 2 && (
                        <span className="text-xs text-blue-500 font-semibold">+{dayRecords.length - 2} more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* Form Section - Right (30%) */}
        <div className="lg:w-[30%] w-full bg-blue-50 rounded-none lg:rounded-r-2xl shadow-xl p-8 flex flex-col min-h-0 justify-center transition-all duration-300">
          <div className="max-w-md w-full mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Attendance Record</h2>
            <form className="space-y-6 bg-blue-50 rounded-xl p-6 shadow-lg">
              {/* Employee Selection */}
              <div className="flex items-center mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1 min-w-[120px]" style={{minWidth:120}}>
                  Employee
                </label>
                <select
                  className="flex-1 border border-blue-300 rounded-md px-3 py-2 text-base bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                  value={selectedEmployeeId ?? ''}
                  onChange={handleEmployeeChange}
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.Fullname}</option>
                  ))}
                </select>
              </div>
              {/* Date Selection */}
              <div className="flex items-center mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1 min-w-[120px]" style={{minWidth:120}}>
                  Date
                </label>
                <input
                  type="date"
                  className="flex-1 border border-blue-300 rounded-md px-3 py-2 text-base bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>
              {/* Attendance Status */}
              <div className="flex items-center mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1 min-w-[120px]" style={{minWidth:120}}>
                  Status
                </label>
                <select
                  className="flex-1 border border-blue-300 rounded-md px-3 py-2 text-base bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                  value={attendanceStatus}
                  onChange={e => setAttendanceStatus(e.target.value)}
                >
                  {attendanceOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              {/* Working Hours */}
              {(attendanceStatus === 'present' || attendanceStatus === 'work-from-home') && (
                <div className="flex items-center mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1 min-w-[120px]" style={{minWidth:120}}>
                    Working Hours
                  </label>
                  <select
                    className="flex-1 border border-blue-300 rounded-md px-3 py-2 text-base bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                    value={workingHours}
                    onChange={e => setWorkingHours(e.target.value)}
                  >
                    <option value="4">4 Hours</option>
                    <option value="6">6 Hours</option>
                    <option value="8">8 Hours</option>
                    <option value="9">9 Hours</option>
                    <option value="10">10 Hours</option>
                  </select>
                </div>
              )}
              {/* Overtime Hours */}
              {attendanceStatus === 'overtime' && (
                <div className="flex items-center mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1 min-w-[120px]" style={{minWidth:120}}>
                    Overtime Hours
                  </label>
                  <select
                    className="flex-1 border border-blue-300 rounded-md px-3 py-2 text-base bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                    value={overtimeHours}
                    onChange={e => setOvertimeHours(e.target.value)}
                  >
                    <option value="1">1 Hour</option>
                    <option value="2">2 Hours</option>
                    <option value="3">3 Hours</option>
                    <option value="4">4 Hours</option>
                    <option value="5">5 Hours</option>
                    <option value="6">6 Hours</option>
                  </select>
                </div>
              )}
              {/* Notes */}
              <div className="flex items-center mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1 min-w-[120px]" style={{minWidth:120}}>
                  Notes
                </label>
                <textarea
                  className="flex-1 border border-blue-300 rounded-md px-3 py-2 text-base bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                  rows={3}
                  placeholder="Add notes..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transform transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
              >
                Save Record
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}