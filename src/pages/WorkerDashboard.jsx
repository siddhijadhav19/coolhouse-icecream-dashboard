import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { 
  Plus, Upload, Download, Trash2, Save, 
  Loader2, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { motion } from 'motion/react';

const WorkerDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [salesData, setSalesData] = useState([
    { flavor_name: '', quantity: '', price: '', date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().split(' ')[0].substring(0, 5) }
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get('/api/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    }
  };

  const addRow = () => {
    setSalesData([...salesData, { flavor_name: '', quantity: '', price: '', date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().split(' ')[0].substring(0, 5) }]);
  };

  const removeRow = (index) => {
    setSalesData(salesData.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, field, value) => {
    const newData = [...salesData];
    newData[index][field] = value;
    
    // Auto-fill price if flavor is selected
    if (field === 'flavor_name') {
      const flavor = inventory.find(i => i.flavor_name === value);
      if (flavor) {
        newData[index].price = flavor.price_per_unit;
      }
    }
    
    setSalesData(newData);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      // Map Excel data to our format
      const mappedData = data.map((row) => ({
        flavor_name: row['Flavor Name'] || row['flavor_name'] || '',
        quantity: row['Quantity'] || row['quantity'] || 0,
        price: row['Price'] || row['price'] || 0,
        date: row['Date'] || row['date'] || new Date().toISOString().split('T')[0],
        time: row['Time'] || row['time'] || '12:00'
      }));
      
      setSalesData([...salesData, ...mappedData]);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      for (const row of salesData) {
        if (!row.flavor_name || !row.quantity) continue;
        
        const flavor = inventory.find(i => i.flavor_name === row.flavor_name);
        if (!flavor) continue;

        await axios.post('/api/sales', {
          flavor_id: flavor.id,
          quantity: parseInt(row.quantity),
          price: parseFloat(row.price),
          date: row.date,
          time: row.time
        });
      }
      setMessage({ type: 'success', text: 'Sales data saved successfully!' });
      setSalesData([{ flavor_name: '', quantity: '', price: '', date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().split(' ')[0].substring(0, 5) }]);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save data' });
    } finally {
      setLoading(false);
    }
  };

  const exportTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 'Flavor Name': 'Vanilla', 'Quantity': 10, 'Price': 5.5, 'Date': '2024-03-20', 'Time': '14:30' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "CoolHouse_Template.xlsx");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Data Entry</h1>
          <p className="text-stone-500 mt-1">Manual entry or Excel upload for sales data</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-600 font-medium hover:bg-stone-50 transition-colors"
          >
            <Download className="w-4 h-4" /> Template
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" /> Upload Excel
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      {message.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </motion.div>
      )}

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-6 py-4 text-sm font-bold text-stone-600">Flavor Name</th>
                <th className="px-6 py-4 text-sm font-bold text-stone-600">Quantity</th>
                <th className="px-6 py-4 text-sm font-bold text-stone-600">Price (₹)</th>
                <th className="px-6 py-4 text-sm font-bold text-stone-600">Date</th>
                <th className="px-6 py-4 text-sm font-bold text-stone-600">Time</th>
                <th className="px-6 py-4 text-sm font-bold text-stone-600 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {salesData.map((row, index) => (
                <tr key={index} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <select 
                      value={row.flavor_name}
                      onChange={(e) => handleInputChange(index, 'flavor_name', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-stone-900 font-medium"
                    >
                      <option value="">Select Flavor</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.flavor_name}>{item.flavor_name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-3">
                    <input 
                      type="number" 
                      value={row.quantity}
                      onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-stone-900"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input 
                      type="number" 
                      value={row.price}
                      onChange={(e) => handleInputChange(index, 'price', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-stone-900"
                      placeholder="0.00"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input 
                      type="date" 
                      value={row.date}
                      onChange={(e) => handleInputChange(index, 'date', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-stone-900"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input 
                      type="time" 
                      value={row.time}
                      onChange={(e) => handleInputChange(index, 'time', e.target.value)}
                      className="w-full bg-transparent border-none focus:ring-0 text-stone-900"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <button 
                      onClick={() => removeRow(index)}
                      className="p-2 text-stone-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-stone-50/50 flex items-center justify-between">
          <button 
            onClick={addRow}
            className="flex items-center gap-2 px-4 py-2 text-rose-500 font-bold hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" /> Add Row
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save All Data</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
