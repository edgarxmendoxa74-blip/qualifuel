import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Calendar, Percent, Users, Hash, ToggleLeft, ToggleRight, Ticket } from 'lucide-react';
import { Voucher } from '../types';
import { useVouchers } from '../hooks/useVouchers';
import Toast, { ToastType } from './Toast';

const VoucherManager: React.FC = () => {
  const { vouchers, loading, error, addVoucher, updateVoucher, deleteVoucher } = useVouchers();
  const [isAdding, setIsAdding] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_percent: 5,
    status: true,
    expiration_date: '',
    usage_limit: ''
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_percent: 5,
      status: true,
      expiration_date: '',
      usage_limit: ''
    });
  };

  const handleAdd = () => {
    resetForm();
    setEditingVoucher(null);
    setIsAdding(true);
  };

  const handleEdit = (voucher: Voucher) => {
    setFormData({
      code: voucher.code,
      discount_percent: voucher.discount_percent,
      status: voucher.status,
      expiration_date: voucher.expiration_date ? voucher.expiration_date.split('T')[0] : '',
      usage_limit: voucher.usage_limit?.toString() || ''
    });
    setEditingVoucher(voucher);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingVoucher(null);
    resetForm();
  };

  const handleSave = async () => {
    if (!formData.code.trim()) {
      showToast('Voucher code is required', 'error');
      return;
    }

    if (formData.discount_percent < 5 || formData.discount_percent > 100) {
      showToast('Discount must be between 5% and 100%', 'error');
      return;
    }

    try {
      setIsProcessing(true);

      const voucherData = {
        code: formData.code.trim().toUpperCase(),
        discount_percent: formData.discount_percent,
        status: formData.status,
        expiration_date: formData.expiration_date || null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null
      };

      if (editingVoucher) {
        await updateVoucher(editingVoucher.id, voucherData);
        showToast('Voucher updated successfully');
      } else {
        await addVoucher(voucherData);
        showToast('Voucher created successfully');
      }

      handleCancel();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to save voucher',
        'error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete voucher "${code}"?`)) return;

    try {
      setIsProcessing(true);
      await deleteVoucher(id);
      showToast('Voucher deleted successfully');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to delete voucher',
        'error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleStatus = async (voucher: Voucher) => {
    try {
      await updateVoucher(voucher.id, { status: !voucher.status });
      showToast(`Voucher ${!voucher.status ? 'activated' : 'deactivated'}`);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to update voucher status',
        'error'
      );
    }
  };

  const getStatusColor = (voucher: Voucher) => {
    if (!voucher.status) return 'text-red-400';
    if (voucher.expiration_date && new Date(voucher.expiration_date) < new Date()) return 'text-yellow-400';
    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) return 'text-orange-400';
    return 'text-green-400';
  };

  const getStatusText = (voucher: Voucher) => {
    if (!voucher.status) return 'Inactive';
    if (voucher.expiration_date && new Date(voucher.expiration_date) < new Date()) return 'Expired';
    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) return 'Limit Reached';
    return 'Active';
  };

  if (loading && vouchers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading vouchers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-quali-primary/20 rounded-xl">
            <Ticket className="h-6 w-6 text-quali-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">
              Voucher Management
            </h2>
            <p className="text-gray-400 text-sm">Manage promo voucher codes and discounts</p>
          </div>
        </div>
        
        {!isAdding && (
          <button
            onClick={handleAdd}
            className="flex items-center space-x-2 bg-quali-gradient text-white px-4 py-2 rounded-xl hover:shadow-[0_0_20px_rgba(154,202,60,0.3)] transition-all font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>Add Voucher</span>
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">
              {editingVoucher ? 'Edit Voucher' : 'Add New Voucher'}
            </h3>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Hash className="h-4 w-4 inline mr-1" />
                Voucher Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-quali-primary"
                placeholder="e.g., SAVE10"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Percent className="h-4 w-4 inline mr-1" />
                Discount Percentage
              </label>
              <input
                type="number"
                min="5"
                max="100"
                value={formData.discount_percent}
                onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 5 })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-quali-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-quali-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Users className="h-4 w-4 inline mr-1" />
                Usage Limit (Optional)
              </label>
              <input
                type="number"
                min="1"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-quali-primary"
                placeholder="Unlimited"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  className="sr-only"
                />
                <div className="relative">
                  {formData.status ? (
                    <ToggleRight className="h-6 w-6 text-quali-primary" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <span className="text-gray-300">Active</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-3 mt-6 pt-6 border-t border-white/10">
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="flex items-center space-x-2 bg-quali-gradient text-white px-4 py-2 rounded-lg hover:shadow-[0_0_20px_rgba(154,202,60,0.3)] transition-all font-medium disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{isProcessing ? 'Saving...' : 'Save Voucher'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-white/20 text-gray-300 rounded-lg hover:bg-white/5 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Vouchers List */}
      <div className="grid gap-4">
        {vouchers.map((voucher) => (
          <div
            key={voucher.id}
            className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-quali-primary/20 p-3 rounded-lg">
                  <Ticket className="h-5 w-5 text-quali-primary" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-bold text-white font-mono tracking-wider">
                      {voucher.code}
                    </h3>
                    <span className="bg-quali-primary/20 text-quali-primary px-2 py-1 rounded-lg text-sm font-bold">
                      {voucher.discount_percent}% OFF
                    </span>
                    <span className={`text-sm font-medium ${getStatusColor(voucher)}`}>
                      {getStatusText(voucher)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                    <span>Used: {voucher.used_count}/{voucher.usage_limit || '∞'}</span>
                    {voucher.expiration_date && (
                      <span>Expires: {new Date(voucher.expiration_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleStatus(voucher)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title={voucher.status ? 'Deactivate' : 'Activate'}
                >
                  {voucher.status ? (
                    <ToggleRight className="h-5 w-5 text-quali-primary" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(voucher)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="h-5 w-5 text-gray-400 hover:text-white" />
                </button>
                <button
                  onClick={() => handleDelete(voucher.id, voucher.code)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Delete"
                  disabled={isProcessing}
                >
                  <Trash2 className="h-5 w-5 text-gray-400 hover:text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {vouchers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Ticket className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No vouchers created yet</p>
          <button
            onClick={handleAdd}
            className="bg-quali-gradient text-white px-6 py-2 rounded-lg hover:shadow-[0_0_20px_rgba(154,202,60,0.3)] transition-all font-medium"
          >
            Create First Voucher
          </button>
        </div>
      )}
    </div>
  );
};

export default VoucherManager;