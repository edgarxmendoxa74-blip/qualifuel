import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, CreditCard, Wallet, ShieldCheck, Zap } from 'lucide-react';
import { usePaymentMethods, PaymentMethod } from '../hooks/usePaymentMethods';
import ImageUpload from './ImageUpload';
import Toast, { ToastType } from './Toast';

interface PaymentMethodManagerProps {
  onBack: () => void;
}

const PaymentMethodManager: React.FC<PaymentMethodManagerProps> = ({ onBack }) => {
  const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod, refetchAll } = usePaymentMethods();
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    account_number: '',
    account_name: '',
    qr_code_url: '',
    active: true,
    sort_order: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  React.useEffect(() => {
    refetchAll();
  }, []);

  const handleAddMethod = () => {
    const nextSortOrder = Math.max(...paymentMethods.map(m => m.sort_order), 0) + 1;
    setFormData({
      id: '',
      name: '',
      account_number: '',
      account_name: '',
      qr_code_url: '',
      active: true,
      sort_order: nextSortOrder
    });
    setCurrentView('add');
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      id: method.id,
      name: method.name,
      account_number: method.account_number,
      account_name: method.account_name,
      qr_code_url: method.qr_code_url,
      active: method.active,
      sort_order: method.sort_order
    });
    setCurrentView('edit');
  };

  const handleDeleteMethod = async (id: string) => {
    if (confirm('Are you sure you want to delete this payment method? Global revenue stream will be impacted.')) {
      try {
        await deletePaymentMethod(id);
        showToast('Gateway decommissioned');
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to delete payment method', 'error');
      }
    }
  };

  const handleSaveMethod = async () => {
    if (!formData.id || !formData.name || !formData.account_number || !formData.account_name || !formData.qr_code_url) {
      alert('Please fill in all required fields');
      return;
    }

    const idRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!idRegex.test(formData.id)) {
      alert('Payment method ID must be in kebab-case format');
      return;
    }

    try {
      setIsProcessing(true);
      if (editingMethod) {
        await updatePaymentMethod(editingMethod.id, formData);
        showToast('Gateway configuration secured');
      } else {
        await addPaymentMethod(formData);
        showToast('New gateway node established');
      }
      setCurrentView('list');
      setEditingMethod(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save payment method', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setCurrentView('list');
    setEditingMethod(null);
  };

  const generateIdFromName = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name, id: currentView === 'add' ? generateIdFromName(name) : formData.id });
  };

  return (
    <div className="animate-fade-in text-pretendard">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-16 gap-8">
        <div className="flex items-center space-x-6">
          <div className="bg-quali-primary/10 p-5 rounded-3xl border border-quali-primary/30 shadow-[0_0_30px_rgba(154,202,60,0.15)]">
            <Wallet className="h-8 w-8 text-quali-primary" />
          </div>
          <div>
            <h2 className="text-5xl font-black text-white tracking-tighter mb-1 uppercase font-pretendard">
              <span className="text-white">Payment </span>
              <span className="text-quali-primary">Terminal</span>
            </h2>
            <p className="text-[10px] font-black text-gray-500 tracking-[0.4em]">Transaction Gateway Control</p>
          </div>
        </div>
        
        {currentView === 'list' ? (
          <div className="flex space-x-4 w-full lg:w-auto">
            <button onClick={onBack} className="bg-white/5 text-white px-8 py-5 rounded-2xl lg:rounded-[1.5rem] hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px] border border-white/10 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" /> Return
            </button>
            <button onClick={handleAddMethod} className="flex-1 lg:flex-none bg-quali-gradient text-white px-10 py-5 rounded-2xl lg:rounded-[1.5rem] hover:scale-105 transition-all font-black uppercase tracking-widest text-xs border border-white/10 shadow-2xl">
              <Plus className="h-4 w-4 mr-2 inline" /> Add Gateway
            </button>
          </div>
        ) : (
          <div className="flex space-x-4 w-full lg:w-auto">
            <button 
              onClick={handleSaveMethod} 
              disabled={isProcessing}
              className="flex-1 lg:flex-none bg-quali-gradient text-white px-10 py-5 rounded-2xl lg:rounded-[1.5rem] hover:shadow-quali-primary/20 transition-all font-black uppercase tracking-widest text-[10px] border border-white/10 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
            >
              {isProcessing ? (
                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2 inline" />
              )}
              {isProcessing ? 'Securing...' : 'Secure Save'}
            </button>
          </div>
        )}
      </div>

      {currentView === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {paymentMethods.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-white/[0.02] rounded-[3.5rem] border-2 border-dashed border-white/5">
              <CreditCard className="h-16 w-16 text-gray-600 mx-auto mb-6 opacity-30" />
              <p className="text-gray-500 font-black tracking-[0.3em] text-xs mb-10">No transaction channels identified</p>
              <button onClick={handleAddMethod} className="bg-quali-primary/10 text-quali-primary px-10 py-5 rounded-2xl border border-quali-primary/20 font-black uppercase tracking-widest text-xs hover:bg-quali-primary/20 transition-all">Provision Gateway</button>
            </div>
          ) : (
            paymentMethods.map((method) => (
              <div key={method.id} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 group hover:border-quali-primary/30 transition-all shadow-2xl flex flex-col min-h-[260px] overflow-hidden relative">
                <div className="absolute top-8 right-8 z-20">
                   <div className={`h-2.5 w-2.5 rounded-full ${method.active ? 'bg-quali-primary shadow-[0_0_15px_rgba(154,202,60,0.8)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'}`} />
                </div>

                <div className="flex flex-1 items-start space-x-8 mb-8">
                  <div className="relative group-hover:scale-105 transition-all duration-500 flex-shrink-0">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl relative z-10 bg-white">
                      <img 
                        src={method.qr_code_url} 
                        alt="QR" 
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <div className="absolute -inset-4 bg-quali-gradient rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-2">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-1 truncate">{method.name}</h3>
                        <p className="text-xs font-black text-quali-primary tracking-widest uppercase mb-4 italic truncate">{method.account_name}</p>
                        
                        <div className="flex flex-wrap gap-3">
                           <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${method.active ? 'bg-quali-primary/10 text-quali-primary border border-quali-primary/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {method.active ? 'READY' : 'OFFLINE'}
                          </span>
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center bg-white/5 px-3 py-1 rounded-full border border-white/5">
                            RANK: #{method.sort_order}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <button onClick={() => handleEditMethod(method)} className="p-3 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-white/5 shadow-lg"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDeleteMethod(method.id)} className="p-3 bg-red-500/5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-red-500/10 shadow-lg"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-2xl px-8 py-6 border border-white/5 flex items-center justify-between shadow-inner mt-auto">
                   <div className="min-w-0">
                      <p className="text-[9px] font-black text-gray-600 mb-1 tracking-widest">Protocol Reference</p>
                      <p className="text-white font-mono font-bold tracking-[0.2em] text-lg lg:text-xl truncate">{method.account_number}</p>
                   </div>
                   <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                      <ShieldCheck className="h-5 w-5 text-quali-primary opacity-40" />
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
          <div className="lg:col-span-7 bg-white/5 backdrop-blur-xl p-10 md:p-16 rounded-[3.5rem] border border-white/10 space-y-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-quali-gradient"></div>
            <p className="text-[10px] font-black text-quali-primary tracking-[0.4em]">Resource Specification</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-500 tracking-widest ml-4">Channel Alias</label>
                <input type="text" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl px-8 py-5 text-white focus:ring-2 focus:ring-quali-primary/50 text-lg font-black italic uppercase placeholder-gray-800" placeholder="e.g. GCASH TERMINAL" />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-500 tracking-widest ml-4">Allocation ID</label>
                <input type="text" value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-2xl px-8 py-5 text-white text-xs font-bold opacity-50 font-mono" placeholder="auto-generated" disabled={currentView === 'edit'} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 tracking-widest ml-4">Account Protocol Reference</label>
              <div className="relative">
                 <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-600" />
                 <input type="text" value={formData.account_number} onChange={(e) => setFormData({ ...formData, account_number: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl pl-16 pr-8 py-6 text-white focus:ring-2 focus:ring-quali-primary/50 font-mono text-xl font-bold tracking-widest" placeholder="09XX XXX XXXX" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 tracking-widest ml-4">Designated Signatory</label>
              <input type="text" value={formData.account_name} onChange={(e) => setFormData({ ...formData, account_name: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl px-8 py-5 text-white focus:ring-2 focus:ring-quali-primary/50 text-base font-black italic uppercase placeholder-gray-800" placeholder="Account Holder Name" />
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-end gap-6">
               <div className="flex space-x-4 w-full md:w-auto">
                  <button 
                    onClick={handleSaveMethod} 
                    disabled={isProcessing}
                    className="flex-1 md:flex-none bg-quali-gradient text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl border border-white/10 hover:scale-[1.02] transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[180px]"
                  >
                    {isProcessing ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
                    ) : (
                      null
                    )}
                    {isProcessing ? 'Processing...' : 'Commit Node'}
                  </button>
               </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-10">
            <div className="bg-white/5 backdrop-blur-xl p-10 md:p-12 rounded-[3.5rem] border border-white/10 shadow-2xl">
              <p className="text-[10px] font-black text-quali-primary tracking-[0.4em] mb-10">Verification Protocol (QR)</p>
              <div className="bg-white rounded-3xl p-6 mb-8 relative overflow-hidden group shadow-2xl">
                <ImageUpload
                  currentImage={formData.qr_code_url}
                  onImageChange={(imageUrl) => setFormData({ ...formData, qr_code_url: imageUrl || '' })}
                />
                {!formData.qr_code_url && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
                      <Zap className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-[8px] font-black uppercase tracking-widest">Scan Target Required</p>
                   </div>
                )}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/10 space-y-8 shadow-2xl">
               <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 space-y-4 w-full">
                    <label className="text-[10px] font-black text-gray-500 tracking-widest ml-4">Dispatch Rank</label>
                    <input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })} className="w-full bg-black/40 border border-white/5 rounded-2xl px-8 py-5 text-white text-center text-2xl font-black italic" />
                  </div>
                  
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-gray-500 tracking-widest ml-4 mb-4 block">Node Status</label>
                    <label className="flex items-center justify-center p-5 bg-black/40 rounded-2xl border border-white/5 cursor-pointer group transition-all hover:bg-white/5">
                      <div className={`w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center relative ${formData.active ? 'bg-quali-primary border-quali-primary shadow-[0_0_15px_rgba(154,202,60,0.4)]' : 'border-gray-700 bg-white/5 group-hover:border-gray-500'}`}>
                        {formData.active && <Save className="h-4 w-4 text-white" />}
                      </div>
                      <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="hidden" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest ml-4">{formData.active ? 'ONLINE' : 'OFFLINE'}</span>
                    </label>
                  </div>
               </div>
            </div>

            <div className="bg-quali-primary/5 p-8 rounded-[2.5rem] border border-dashed border-quali-primary/20 text-center">
               <ShieldCheck className="h-8 w-8 text-quali-primary/40 mx-auto mb-4" />
               <p className="text-[9px] font-black text-gray-500 tracking-[0.2em] leading-relaxed">
                  Encryption active. All transaction specification updates are logged in the secure admin vault.
               </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodManager;