import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Edit2, Trash2, Loader2, 
  AlertTriangle, Package, Save, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState(null);
  const [formData, setFormData] = useState({ flavor_name: '', stock_quantity: 0, price_per_unit: 0 });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axios.get('/api/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (flavor = null) => {
    if (flavor) {
      setEditingFlavor(flavor);
      setFormData({ 
        flavor_name: flavor.flavor_name, 
        stock_quantity: flavor.stock_quantity, 
        price_per_unit: flavor.price_per_unit 
      });
    } else {
      setEditingFlavor(null);
      setFormData({ flavor_name: '', stock_quantity: 0, price_per_unit: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFlavor) {
        await axios.put(`/api/inventory/${editingFlavor.id}`, formData);
      } else {
        await axios.post('/api/inventory', formData);
      }
      fetchInventory();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save flavor', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this flavor?')) {
      try {
        await axios.delete(`/api/inventory/${id}`);
        fetchInventory();
      } catch (err) {
        console.error('Failed to delete flavor', err);
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Inventory Management</h1>
          <p className="text-stone-500 mt-1">Manage flavors, stock levels, and pricing</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
        >
          <Plus className="w-5 h-5" /> Add New Flavor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-stone-500 text-sm font-medium">Total Flavors</p>
            <p className="text-2xl font-bold text-stone-900">{inventory.length}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-stone-500 text-sm font-medium">Low Stock Items</p>
            <p className="text-2xl font-bold text-stone-900">{inventory.filter(i => i.stock_quantity > 0 && i.stock_quantity < 10).length}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-500">
            <X className="w-6 h-6" />
          </div>
          <div>
            <p className="text-stone-500 text-sm font-medium">Out of Stock</p>
            <p className="text-2xl font-bold text-stone-900">{inventory.filter(i => i.stock_quantity === 0).length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="px-6 py-4 text-sm font-bold text-stone-600">Flavor Name</th>
              <th className="px-6 py-4 text-sm font-bold text-stone-600">Stock Quantity</th>
              <th className="px-6 py-4 text-sm font-bold text-stone-600">Price per Unit (₹)</th>
              <th className="px-6 py-4 text-sm font-bold text-stone-600">Status</th>
              <th className="px-6 py-4 text-sm font-bold text-stone-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-stone-900">{item.flavor_name}</td>
                <td className="px-6 py-4 text-stone-600">{item.stock_quantity} units</td>
                <td className="px-6 py-4 text-stone-600">₹{item.price_per_unit.toFixed(2)}</td>
                <td className="px-6 py-4">
                  {item.stock_quantity === 0 ? (
                    <span className="px-3 py-1 bg-stone-100 text-stone-600 text-xs font-bold rounded-full uppercase tracking-wider">Out of Stock</span>
                  ) : item.stock_quantity < 10 ? (
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full uppercase tracking-wider">Low Stock</span>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full uppercase tracking-wider">In Stock</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleOpenModal(item)}
                      className="p-2 text-stone-400 hover:text-rose-500 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-stone-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-stone-900 mb-6">
                {editingFlavor ? 'Edit Flavor' : 'Add New Flavor'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Flavor Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.flavor_name}
                    onChange={(e) => setFormData({...formData, flavor_name: e.target.value})}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    placeholder="e.g. Belgian Chocolate"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Stock Quantity</label>
                    <input 
                      type="number" 
                      required
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Price per Unit (₹)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={formData.price_per_unit}
                      onChange={(e) => setFormData({...formData, price_per_unit: parseFloat(e.target.value)})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 bg-stone-100 text-stone-600 font-bold rounded-xl hover:bg-stone-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
                  >
                    {editingFlavor ? 'Save Changes' : 'Add Flavor'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventoryPage;
