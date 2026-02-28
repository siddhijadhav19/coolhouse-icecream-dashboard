import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { 
  Download, Calendar, 
  Loader2 
} from 'lucide-react';

const ReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/reports/data', { params: filters });
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to fetch report', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData) return;
    
    const wb = XLSX.utils.book_new();
    
    // Sales Sheet
    const salesWs = XLSX.utils.json_to_sheet(reportData.sales.map((s) => ({
      'Date': s.date,
      'Time': s.time,
      'Flavor': s.flavor_name,
      'Quantity': s.quantity,
      'Price': s.price,
      'Total Amount': s.total_amount
    })));
    XLSX.utils.book_append_sheet(wb, salesWs, "Sales Report");

    // Expenses Sheet
    const expWs = XLSX.utils.json_to_sheet(reportData.expenses.map((e) => ({
      'Date': e.date,
      'Description': e.description,
      'Amount': e.amount
    })));
    XLSX.utils.book_append_sheet(wb, expWs, "Expenses Report");

    XLSX.writeFile(wb, `CoolHouse_Report_${filters.startDate}_to_${filters.endDate}.xlsx`);
  };

  const calculateSummary = () => {
    if (!reportData) return { sales: 0, expenses: 0, profit: 0 };
    const sales = reportData.sales.reduce((acc, s) => acc + s.total_amount, 0);
    const expenses = reportData.expenses.reduce((acc, e) => acc + e.amount, 0);
    return { sales, expenses, profit: sales - expenses };
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Financial Reports</h1>
          <p className="text-stone-500 mt-1">Generate and export detailed business reports</p>
        </div>
        <button 
          onClick={exportToExcel}
          disabled={!reportData}
          className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all shadow-lg shadow-stone-200 disabled:opacity-50"
        >
          <Download className="w-5 h-5" /> Export Excel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-wrap items-end gap-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Start Date
          </label>
          <input 
            type="date" 
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-semibold text-stone-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> End Date
          </label>
          <input 
            type="date" 
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>
        <button 
          onClick={fetchReport}
          className="px-8 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
        >
          Apply Filters
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
        </div>
      ) : reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-stone-100 shadow-sm">
              <p className="text-stone-500 font-medium mb-1">Period Sales</p>
              <p className="text-3xl font-bold text-stone-900">₹{summary.sales.toLocaleString()}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-stone-100 shadow-sm">
              <p className="text-stone-500 font-medium mb-1">Period Expenses</p>
              <p className="text-3xl font-bold text-stone-900">₹{summary.expenses.toLocaleString()}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-stone-100 shadow-sm">
              <p className="text-stone-500 font-medium mb-1">Net Profit</p>
              <p className={`text-3xl font-bold ${summary.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                ₹{summary.profit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Sales Table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-900">Detailed Sales</h3>
              <span className="text-sm text-stone-500">{reportData.sales.length} transactions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <th className="px-6 py-4 text-sm font-bold text-stone-600">Date</th>
                    <th className="px-6 py-4 text-sm font-bold text-stone-600">Flavor</th>
                    <th className="px-6 py-4 text-sm font-bold text-stone-600">Qty</th>
                    <th className="px-6 py-4 text-sm font-bold text-stone-600">Price</th>
                    <th className="px-6 py-4 text-sm font-bold text-stone-600 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {reportData.sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 text-stone-600 text-sm">{sale.date}</td>
                      <td className="px-6 py-4 font-bold text-stone-900">{sale.flavor_name}</td>
                      <td className="px-6 py-4 text-stone-600">{sale.quantity}</td>
                      <td className="px-6 py-4 text-stone-600">₹{sale.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-bold text-stone-900">₹{sale.total_amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
