import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, FolderOpen, Zap } from 'lucide-react';
import { useCategories, Category } from '../hooks/useCategories';
import ImageUpload from './ImageUpload';
import Toast, { ToastType } from './Toast';

interface CategoryManagerProps {
  onBack: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ onBack }) => {
  const { categories, addCategory, updateCategory, deleteCategory, fetchAll } = useCategories();
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit'>('list');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    icon: '',
    sort_order: 0,
    active: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  React.useEffect(() => {
    fetchAll();
  }, []);

  const handleAddCategory = () => {
    const nextSortOrder = Math.max(...categories.map(c => c.sort_order), 0) + 1;
    setFormData({
      id: '',
      name: '',
      icon: '',
      sort_order: nextSortOrder,
      active: true
    });
    setCurrentView('add');
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      id: category.id,
      name: category.name,
      icon: category.icon,
      sort_order: category.sort_order,
      active: category.active
    });
    setCurrentView('edit');
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Are you sure you want to delete this category? Sector will be removed from logistics.')) {
      try {
        await deleteCategory(id);
        showToast('Sector decommissioned successfully');
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to delete category', 'error');
      }
    }
  };

  const handleSaveCategory = async () => {
    if (!formData.id || !formData.name) {
      alert('Please fill in all required fields');
      return;
    }

    const idRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!idRegex.test(formData.id)) {
      alert('Category ID must be in kebab-case format');
      return;
    }

    try {
      setIsProcessing(true);
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        showToast('Sector configuration updated');
      } else {
        await addCategory(formData);
        showToast('New sector established');
      }
      setCurrentView('list');
      setEditingCategory(null);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save category', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setCurrentView('list');
    setEditingCategory(null);
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
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
        <div className="flex items-center space-x-6">
          <div className="bg-quali-primary/10 p-5 rounded-3xl border border-quali-primary/30 shadow-[0_0_30px_rgba(154,202,60,0.15)]">
            <FolderOpen className="h-8 w-8 text-quali-primary" />
          </div>
          <div>
            <h2 className="text-5xl font-black text-white italic tracking-tighter mb-1 uppercase font-pretendard">
              <span className="text-white">Manage </span>
              <span className="text-quali-primary">Types</span>
            </h2>
            <p className="text-[10px] font-black text-gray-500 tracking-[0.4em]">Inventory Category Control</p>
          </div>
        </div>
        
        {currentView === 'list' ? (
          <div className="flex space-x-4 w-full md:w-auto">
            <button onClick={onBack} className="bg-white/5 text-white px-8 py-5 rounded-2xl md:rounded-[1.5rem] hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px] border border-white/10 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" /> Return
            </button>
            <button onClick={handleAddCategory} className="flex-1 md:flex-none bg-quali-gradient text-white px-10 py-5 rounded-2xl md:rounded-[1.5rem] hover:scale-105 transition-all font-black uppercase tracking-widest text-xs border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              <Plus className="h-5 w-5 mr-2 inline" /> Create Sector
            </button>
          </div>
        ) : (
          <div className="flex space-x-4 w-full md:w-auto">
            <button onClick={handleCancel} className="flex-1 md:flex-none bg-white/5 text-white px-8 py-5 rounded-2xl md:rounded-[1.5rem] hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px] border border-white/10">
              <X className="h-4 w-4 mr-2 inline" /> Abort
            </button>
            <button 
              onClick={handleSaveCategory} 
              disabled={isProcessing}
              className="flex-1 md:flex-none bg-quali-gradient text-white px-10 py-5 rounded-2xl md:rounded-[1.5rem] hover:shadow-[0_0_30px_rgba(154,202,60,0.2)] transition-all font-black uppercase tracking-widest text-[10px] border border-white/10 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
            >
              {isProcessing ? (
                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2 inline" />
              )}
              {isProcessing ? 'Deploying...' : 'Deploy'}
            </button>
          </div>
        )}
      </div>

      {currentView === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.length === 0 ? (
            <div className="col-span-full py-32 text-center bg-white/[0.02] rounded-[3.5rem] border-2 border-dashed border-white/5">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                 <Zap className="h-10 w-10 text-gray-600" />
              </div>
              <p className="text-gray-500 font-black tracking-[0.3em] text-xs mb-10">No Provisioning Sectors Identified</p>
              <button onClick={handleAddCategory} className="bg-quali-primary/10 text-quali-primary px-10 py-5 rounded-2xl border border-quali-primary/20 font-black uppercase tracking-widest text-xs hover:bg-quali-primary/20 transition-all">Establish First Sector</button>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 group hover:border-quali-primary/40 transition-all shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center space-x-4">

                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <div className={`h-2 w-2 rounded-full ${category.active ? 'bg-quali-primary shadow-[0_0_10px_rgba(154,202,60,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
                            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">{category.name}</h3>
                          </div>
                          <span className="text-[8px] font-black text-gray-500 tracking-widest uppercase">ID: {category.id}</span>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                       <button onClick={() => handleEditCategory(category)} className="p-3 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-white/5"><Edit className="h-4 w-4" /></button>
                       <button onClick={() => handleDeleteCategory(category.id)} className="p-3 bg-red-500/5 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-red-500/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                    <span className="text-[10px] font-black text-quali-primary italic leading-none">Rank #{category.sort_order}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl p-10 md:p-16 rounded-[3.5rem] border border-white/10 space-y-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-quali-gradient"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-500 tracking-[0.3em] ml-2">Sector Identity</label>
                <input type="text" value={formData.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl px-8 py-5 text-white focus:ring-2 focus:ring-quali-primary/50 text-base font-black italic uppercase placeholder-gray-700" placeholder="e.g. PERFORMANCE PROTEIN" />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-500 tracking-[0.3em] ml-2">System Allocation Code</label>
                <input type="text" value={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} className="w-full bg-black/20 border border-white/5 rounded-2xl px-8 py-5 text-white text-xs font-bold opacity-50 font-mono" placeholder="auto-generated-id" disabled={currentView === 'edit'} />
              </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-500 tracking-[0.3em] ml-2">Logistics Priority Rank</label>
                <div className="relative">
                   <Zap className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-quali-primary opacity-50" />
                   <input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })} className="w-full bg-black/40 border border-white/5 rounded-2xl pl-16 pr-8 py-5 text-white text-xl font-black italic" />
                </div>
              </div>
            </div>

            <div className="p-8 bg-quali-primary/5 rounded-[2.5rem] border border-quali-primary/10 shadow-inner">
              <label className="flex items-center space-x-6 cursor-pointer group">
                <div className={`w-10 h-10 rounded-2xl border-2 transition-all flex items-center justify-center relative ${formData.active ? 'bg-quali-primary border-quali-primary shadow-[0_0_20px_rgba(154,202,60,0.4)]' : 'border-gray-700 bg-black/20 group-hover:border-gray-500'}`}>
                  {formData.active && <Save className="h-5 w-5 text-white" />}
                </div>
                <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="hidden" />
                <div>
                   <span className="text-sm font-black text-white tracking-widest italic block">Active System Node</span>
                   <span className="text-[9px] font-black text-gray-500 tracking-widest">Enable sector in global logistics network</span>
                </div>
              </label>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
               <p className="text-[10px] font-black text-gray-600 tracking-[0.4em] italic">QualiFuel Admin Protocol v2.5</p>
               <div className="flex space-x-4">
                  <button onClick={handleCancel} className="px-10 py-5 rounded-2xl text-xs font-black uppercase text-gray-500 hover:text-white transition-colors tracking-widest">Dismiss</button>
                   <button 
                    onClick={handleSaveCategory} 
                    disabled={isProcessing}
                    className="bg-quali-gradient text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl border border-white/10 hover:scale-[1.02] transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[180px]"
                   >
                    {isProcessing ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
                    ) : (
                      null
                    )}
                    {isProcessing ? 'Processing...' : 'Commit Changes'}
                   </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
