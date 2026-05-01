import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, ArrowLeft, Package, 
  Settings as SettingsIcon, FolderOpen, CreditCard, Lock, Menu as MenuIcon
} from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';
import { useMenu } from '../hooks/useMenu';
import { useCategories } from '../hooks/useCategories';
import ImageUpload from './ImageUpload';
import CategoryManager from './CategoryManager';
import PaymentMethodManager from './PaymentMethodManager';
import SiteSettingsManager from './SiteSettingsManager';
import Toast, { ToastType } from './Toast';

import { useSiteSettings } from '../hooks/useSiteSettings';

const AdminDashboard: React.FC = () => {
  const { siteSettings, loading: settingsLoading, error: settingsError } = useSiteSettings();
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('qualifuel_admin_auth') === 'true');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { menuItems, loading: menuLoading, error: menuError, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu();
  const { categories, loading: categoriesLoading, error: categoryError } = useCategories();
  

  const error = settingsError || menuError || categoryError;
  


  const [currentView, setCurrentView] = useState<'items' | 'add' | 'edit' | 'categories' | 'payments' | 'settings'>('items');

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '', description: '', basePrice: 0, category: '', popular: false, available: true, variations: [], addOns: []
  });
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const MAX_MENU_ITEMS = 100;

  const handleAddItem = () => {
    if (menuItems.length >= MAX_MENU_ITEMS) {
      showToast(`Database Capacity Reached: Maximum of ${MAX_MENU_ITEMS} assets allowed to maintain performance.`, 'error');
      return;
    }
    const defaultCategory = categories.length > 0 ? categories[0].id : '';
    setFormData({ name: '', description: '', basePrice: 0, category: defaultCategory, popular: false, available: true, variations: [], addOns: [] });
    setEditingItem(null);
    setCurrentView('add');
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setCurrentView('edit');
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this dietary asset? Protocol will be irreversible.')) {
      try {
        setIsProcessing(true);
        await deleteMenuItem(id);
        showToast('Asset decommissioned successfully');
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Failed to delete item', 'error');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.description || !formData.basePrice) {
      alert('Please fill in all required fields.');
      return;
    }
    const validCategoryIds = categories.map(c => c.id);
    if (!formData.category || !validCategoryIds.includes(formData.category)) {
      alert('Please select a valid category. If no categories exist, create one first in Manage Types.');
      return;
    }
    try {
      setIsProcessing(true);
      
      const isUpdating = editingItem && !editingItem.id.startsWith('sample-');
      
      if (isUpdating) {
        // For updates, we can be optimistic
        setCurrentView('items');
        showToast('Asset sync initiated...');
        await updateMenuItem(editingItem!.id, formData);
        showToast('Asset updated successfully');
      } else {
        // For new items, we wait to get the real ID and confirm insertion
        showToast('Provisioning new asset...');
        await addMenuItem(formData as Omit<MenuItem, 'id'>);
        showToast('Asset provisioned successfully');
        setCurrentView('items');
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Sync failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const addVariation = () => {
    const newVariation: Variation = { id: `var-${Date.now()}`, name: '', price: 0 };
    setFormData({ ...formData, variations: [...(formData.variations || []), newVariation] });
  };

  const updateVariation = (index: number, field: keyof Variation, value: string | number) => {
    const updatedVariations = [...(formData.variations || [])];
    updatedVariations[index] = { ...updatedVariations[index], [field]: value };
    setFormData({ ...formData, variations: updatedVariations });
  };


  const removeVariation = (index: number) => {
    const updatedVariations = formData.variations?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, variations: updatedVariations });
  };

  const addAddOn = () => {
    const newAddOn: AddOn = { id: `addon-${Date.now()}`, name: '', price: 0, category: 'extras' };
    setFormData({ ...formData, addOns: [...(formData.addOns || []), newAddOn] });
  };

  const updateAddOn = (index: number, field: keyof AddOn, value: string | number) => {
    const updatedAddOns = [...(formData.addOns || [])];
    updatedAddOns[index] = { ...updatedAddOns[index], [field]: value };
    setFormData({ ...formData, addOns: updatedAddOns });
  };

  const removeAddOn = (index: number) => {
    const updatedAddOns = formData.addOns?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, addOns: updatedAddOns });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('qualifuel_admin_auth');
    showToast('Secure Session Terminated');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'QualiFuel@Admin!2025') {
      setIsAuthenticated(true);
      localStorage.setItem('qualifuel_admin_auth', 'true');
      setLoginError('');
      showToast('System Authorization Granted');
    } else {
      setLoginError('Invalid access protocol');
    }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-quali-dark flex items-center justify-center p-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border border-white/10 text-center">
        <div className="mx-auto w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
          <Lock className="h-10 w-10 text-quali-primary" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter mb-8 uppercase font-pretendard">
          {siteSettings?.site_name === "QualiFuel" || !siteSettings?.site_name ? (
            <>
              <span className="text-white">Quali</span>
              <span className="text-quali-primary">Fuel</span>
            </>
          ) : (
            siteSettings.site_name
          )}
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-quali-primary/50" placeholder="••••••••" required />
          {loginError && <p className="text-red-500 text-xs font-bold">❌ {loginError}</p>}
          <button type="submit" className="w-full bg-quali-gradient text-white py-5 rounded-2xl font-black uppercase tracking-widest text-lg border border-white/10 shadow-lg group">🔓 Access Portal</button>
        </form>
      </div>
    </div>
  );

  // No longer blocking the entire UI with a full-screen loader.
  // We'll handle individual loading states within the dashboard sections.


  const navItems = [
    { id: 'items', label: 'Fuel Inventory', icon: Package },
    { id: 'categories', label: 'Manage Types', icon: FolderOpen },
    { id: 'payments', label: 'Payment Hub', icon: CreditCard },
    { id: 'settings', label: 'System Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-black text-pretendard flex flex-col font-pretendard">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-6 right-6 z-[60] p-4 bg-quali-gradient text-white rounded-2xl shadow-xl border border-white/10"
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-[55]"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 w-80 bg-white/5 backdrop-blur-2xl border-r border-white/10 flex flex-col z-[58] transition-transform duration-500 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-10 border-b border-white/10">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 group cursor-pointer">
              <img src={siteSettings?.site_logo || "/logo.jpg"} alt="Logo" className="h-16 w-16 object-cover rounded-full border border-quali-primary/30" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase font-pretendard">
              {siteSettings?.site_name === "QualiFuel" || !siteSettings?.site_name ? (
                <>
                  <span className="text-white">Quali</span>
                  <span className="text-quali-primary">Fuel</span>
                </>
              ) : (
                siteSettings.site_name
              )}
            </h1>
            <div className="flex items-center justify-between w-full mt-2 border-t border-white/5 pt-2">
              <p className="text-[8px] font-black text-gray-500 tracking-[0.3em] uppercase">Admin Protocol</p>
              <div className="flex items-center space-x-1.5">
                <div className="h-1 w-1 rounded-full bg-quali-primary animate-pulse" />
                <span className="text-[8px] font-black text-quali-primary tracking-widest uppercase">
                  {menuItems?.length || 0} Assets
                </span>
              </div>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-10 px-6 space-y-3 overflow-y-auto">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => {
                setCurrentView(item.id as any);
                setIsSidebarOpen(false);
              }} 
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-[1.5rem] transition-all font-black uppercase tracking-widest text-[10px] ${currentView === item.id || (currentView === 'add' || currentView === 'edit') && item.id === 'items' ? 'bg-quali-gradient text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-8 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-[1.5rem] text-red-500 hover:bg-red-500/10 font-black uppercase tracking-widest text-[10px] border border-red-500/20 transition-all">
            <Lock className="h-4 w-4" />
            <span>Secure Exit</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative h-screen bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto p-6 md:p-12 lg:p-16">
          
          {error && (
            <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <Lock className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-white font-black text-xs uppercase tracking-widest">Protocol Sync Failure</p>
                  <p className="text-red-500/80 text-[10px] font-bold">{error}</p>
                </div>
              </div>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10"
              >
                Retry Sync
              </button>
            </div>
          )}



          {currentView === 'items' && (
            <div className="animate-fade-in space-y-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-10">
                <div>
                  <h2 className="text-5xl font-black text-white italic tracking-tighter mb-1 uppercase">Fuel <span className="text-quali-primary">Inventory</span></h2>
                  <div className="flex items-center space-x-3">
                    <p className="text-gray-400 font-bold tracking-[0.3em] text-[10px]">Managing {menuItems?.length || 0} Registered Assets</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[8px] font-black text-gray-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-widest">
                        System Capacity: {menuItems?.length || 0} / 100
                      </span>
                      {menuItems?.filter(item => !categories.some(c => c.id === item.category)).length > 0 && (
                        <span className="text-[8px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full animate-pulse border border-red-500/20 uppercase tracking-widest">
                          {menuItems?.filter(item => !categories.some(c => c.id === item.category)).length} Orphaned Assets
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                  <button onClick={handleAddItem} className="bg-quali-gradient text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 shadow-lg hover:scale-105 transition-all flex items-center space-x-3">
                    <Plus className="h-5 w-5" />
                    <span>New Asset</span>
                  </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {(menuItems || []).map(item => (
                  <div key={item.id} className="group bg-white/5 border border-white/10 rounded-[1.5rem] overflow-hidden hover:bg-white/[0.08] transition-all hover:shadow-2xl hover:shadow-quali-primary/10">
                    <div className="relative h-40 bg-white/5 overflow-hidden">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-700" 
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-20">
                          <Package className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex space-x-1.5">
                        <button title="Edit" onClick={() => handleEditItem(item)} className="p-2 bg-black/50 backdrop-blur-md text-white rounded-lg hover:bg-quali-primary transition-colors border border-white/10">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button title="Delete" onClick={() => handleDeleteItem(item.id)} className="p-2 bg-black/50 backdrop-blur-md text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors border border-white/10">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-black text-white italic truncate tracking-tight uppercase">{item.name}</h4>
                        <span className={`h-1.5 w-1.5 rounded-full ${item.available ? 'bg-quali-primary' : 'bg-red-500'} shadow-[0_0_10px_currentColor]`} />
                      </div>
                      <p className="text-[9px] text-gray-500 line-clamp-1 font-bold mb-3">{item.description}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <p className="text-sm font-black text-quali-primary italic">₱{item.basePrice}</p>
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{categories.find(cat => cat.id === item.category)?.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(currentView === 'add' || currentView === 'edit') && (
            <div className="animate-fade-in space-y-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-10">
                <div className="flex items-center space-x-6">
                  <button title="Back" onClick={() => setCurrentView('items')} className="p-4 bg-white/5 text-white rounded-2xl border border-white/10 hover:bg-white/10 transition-all"><ArrowLeft className="h-6 w-6" /></button>
                  <div>
                    <h2 className="text-5xl font-black text-white italic tracking-tighter mb-1">{currentView === 'add' ? 'Provision' : 'Refuel'} <span className="text-quali-primary">Asset</span></h2>
                    <p className="text-gray-400 font-bold tracking-[0.3em] text-[10px]">Configure dietary specifications</p>
                  </div>
                </div>
                <button onClick={handleSaveItem} disabled={isProcessing} className="bg-quali-gradient text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest border border-white/10 shadow-lg hover:scale-105 transition-all flex items-center space-x-3">{isProcessing ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Save className="h-5 w-5" />}<span>{isProcessing ? 'Processing' : 'Commit Changes'}</span></button>
              </div>
              <div className="bg-white/5 p-12 rounded-[3.5rem] border border-white/10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 tracking-[0.3em]">Identity Matrix</label>
                    <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:ring-2 focus:ring-quali-primary/50" placeholder="Asset Name" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 tracking-[0.3em]">Base Value (\u20b1)</label>
                    <input type="number" value={formData.basePrice || ''} onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:ring-2 focus:ring-quali-primary/50" placeholder="0" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 tracking-[0.3em]">Sector Allocation</label>
                    <select value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:ring-2 focus:ring-quali-primary/50" title="Select Category">
                      {categories.length === 0 && <option value="" disabled className="bg-quali-dark">No categories available</option>}
                      {!formData.category && categories.length > 0 && <option value="" disabled className="bg-quali-dark">-- Select a Category --</option>}
                      {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-quali-dark uppercase">{cat.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center space-x-8 pt-8">
                    <label className="flex items-center space-x-4 cursor-pointer group">
                      <input type="checkbox" checked={formData.popular || false} onChange={(e) => setFormData({ ...formData, popular: e.target.checked })} className="w-6 h-6 rounded border-white/20 text-quali-secondary focus:ring-quali-secondary bg-transparent" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest group-hover:text-quali-secondary transition-colors">Mark Popular</span>
                    </label>
                    <label className="flex items-center space-x-4 cursor-pointer group">
                      <input type="checkbox" checked={formData.available ?? true} onChange={(e) => setFormData({ ...formData, available: e.target.checked })} className="w-6 h-6 rounded border-white/20 text-quali-primary focus:ring-quali-primary bg-transparent" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest group-hover:text-quali-primary transition-colors">Ready for Order</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Dietary Brief</label>
                  <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:ring-2 focus:ring-quali-primary/50 min-h-[150px]" placeholder="Provisioning details..." />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Visual Assets</label>
                  <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/10"><ImageUpload currentImage={formData.image} onImageChange={(url) => setFormData({ ...formData, image: url })} /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                  {/* Variations */}
                    <div className="space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                          <label className="text-[10px] font-black text-gray-500 tracking-[0.3em]">Flavor Variations</label>
                        </div>
                        <button onClick={addVariation} className="p-2 bg-quali-primary/10 text-quali-primary rounded-lg hover:bg-quali-primary/20 transition-all border border-quali-primary/20 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest"><Plus className="h-3 w-3" /><span>Add Var</span></button>
                      </div>
                      <div className="space-y-3">
                        {formData.variations?.map((v, i) => (
                          <div key={v.id} className="flex items-center space-x-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                            <input type="text" value={v.name} onChange={(e) => updateVariation(i, 'name', e.target.value)} className="flex-1 bg-transparent border-none text-white font-bold text-xs focus:ring-0 px-2" placeholder="Variant Name" />
                            <input type="number" value={v.price} onChange={(e) => updateVariation(i, 'price', Number(e.target.value))} className="w-24 bg-transparent border-none text-white font-black italic text-sm focus:ring-0 text-right pr-4 border-r border-white/10" placeholder="\u20b1" />
                            <button title="Remove Variation" onClick={() => removeVariation(i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><X className="h-4 w-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                  {/* Add-ons */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-500 tracking-[0.3em]">Optional Add-ons</label>
                      <button onClick={addAddOn} className="p-2 bg-quali-secondary/10 text-quali-secondary rounded-lg hover:bg-quali-secondary/20 transition-all border border-quali-secondary/20 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest"><Plus className="h-3 w-3" /><span>Add Extra</span></button>
                    </div>
                    <div className="space-y-3">
                      {formData.addOns?.map((a, i) => (
                        <div key={a.id} className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl border border-white/10">
                          <input type="text" value={a.name} onChange={(e) => updateAddOn(i, 'name', e.target.value)} className="flex-1 bg-transparent border-none text-white text-xs focus:ring-0" placeholder="Add-on Name" />
                          <input type="number" value={a.price} onChange={(e) => updateAddOn(i, 'price', Number(e.target.value))} className="w-20 bg-transparent border-none text-white text-xs focus:ring-0" placeholder="\u20b1" />
                          <button title="Remove Add-on" onClick={() => removeAddOn(i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'categories' && <div className="animate-fade-in"><CategoryManager onBack={() => setCurrentView('items')} /></div>}
          {currentView === 'payments' && <div className="animate-fade-in"><PaymentMethodManager onBack={() => setCurrentView('items')} /></div>}
          {currentView === 'settings' && <div className="animate-fade-in"><SiteSettingsManager /></div>}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;