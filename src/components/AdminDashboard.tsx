import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, ArrowLeft, Coffee, TrendingUp, 
  Package, Users, Lock, FolderOpen, CreditCard, 
  Settings as SettingsIcon, LayoutDashboard, Search, Filter,
  Upload, Image as ImageIcon
} from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';
import { addOnCategories } from '../data/menuData';
import { useMenu } from '../hooks/useMenu';
import { useCategories } from '../hooks/useCategories';
import ImageUpload from './ImageUpload';
import CategoryManager from './CategoryManager';
import PaymentMethodManager from './PaymentMethodManager';
import SiteSettingsManager from './SiteSettingsManager';

import { useSiteSettings } from '../hooks/useSiteSettings';

const AdminDashboard: React.FC = () => {
  const { siteSettings, loading: settingsLoading } = useSiteSettings();
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('qualifuel_admin_auth') === 'true');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { menuItems, loading, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu();
  const { categories } = useCategories();
  
  // Dashboard Metrics (derived state)
  const totalAssetCount = menuItems?.length || 0;
  const popularAssetCount = menuItems?.filter(item => item.popular).length || 0;
  const availableAssetCount = menuItems?.filter(item => item.available).length || 0;
  const sectorCount = categories?.length || 0;

  const [currentView, setCurrentView] = useState<'dashboard' | 'items' | 'add' | 'edit' | 'categories' | 'payments' | 'settings'>('dashboard');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '', description: '', basePrice: 0, category: 'hot-coffee', popular: false, available: true, variations: [], addOns: []
  });

  const handleAddItem = () => {
    const defaultCategory = categories.length > 0 ? categories[0].id : 'coffee';
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
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        setIsProcessing(true);
        await deleteMenuItem(id);
      } catch (error) {
        alert('Failed to delete item.');
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
    try {
      setIsProcessing(true);
      if (editingItem) {
        await updateMenuItem(editingItem.id, formData);
      } else {
        await addMenuItem(formData as Omit<MenuItem, 'id'>);
      }
      setCurrentView('items');
    } catch (error) {
      alert('Failed to save item.');
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

  const handleVariationImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      updateVariation(index, 'image', reader.result as string);
    };
    reader.readAsDataURL(file);
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
    setCurrentView('dashboard');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'QualiFuel@Admin!2025') {
      setIsAuthenticated(true);
      localStorage.setItem('qualifuel_admin_auth', 'true');
    } else {
      setLoginError('Invalid password');
    }
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen bg-quali-dark flex items-center justify-center p-4">
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
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-quali-primary/50" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required />
          {loginError && <p className="text-red-500 text-xs font-bold">\u274c {loginError}</p>}
          <button type="submit" className="w-full bg-quali-gradient text-white py-5 rounded-2xl font-black uppercase tracking-widest text-lg border border-white/10 shadow-lg group">🔓 Access Portal</button>
        </form>
      </div>
    </div>
  );

  if (loading || settingsLoading) return (
    <div className="min-h-screen bg-quali-dark flex items-center justify-center font-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-quali-primary mx-auto mb-4"></div>
        <p className="text-gray-400 uppercase tracking-widest text-[10px]">Accessing Secure Core...</p>
      </div>
    </div>
  );

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'items', label: 'Fuel Inventory', icon: Package },
    { id: 'categories', label: 'Manage Types', icon: FolderOpen },
    { id: 'payments', label: 'Payment Hub', icon: CreditCard },
    { id: 'settings', label: 'System Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-quali-dark flex overflow-hidden font-pretendard relative">
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-6 right-6 z-[60] p-4 bg-quali-gradient text-white rounded-2xl shadow-xl border border-white/10"
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <LayoutDashboard className="h-6 w-6" />}
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
              <img src={siteSettings?.site_logo || "/logo.jpg"} alt="Logo" className="h-16 w-16 object-contain rounded-full border border-quali-primary/30" />
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
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] mt-1">Admin Protocol</p>
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
          
          {currentView === 'dashboard' && (
            <div className="animate-fade-in space-y-12">
              <div className="flex items-end justify-between border-b border-white/10 pb-10">
                <div>
                  <h2 className="text-5xl font-black text-white tracking-tighter mb-1 font-pretendard">
                    <span className="text-white">Central </span>
                    <span className="text-quali-primary">Dashboard</span>
                  </h2>
                  <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">Real-time logistics oversee</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                  <Package className="h-6 w-6 text-quali-primary mb-4" />
                  <p className="text-5xl font-black text-white italic mb-1">{totalAssetCount}</p>
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Assets</h3>
                </div>
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                  <TrendingUp className="h-6 w-6 text-quali-secondary mb-4" />
                  <p className="text-5xl font-black text-white italic mb-1">{popularAssetCount}</p>
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Hot Zone</h3>
                </div>
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                  <Coffee className="h-6 w-6 text-green-500 mb-4" />
                  <p className="text-5xl font-black text-white italic mb-1">{availableAssetCount}</p>
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Ready</h3>
                </div>
                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                  <Users className="h-6 w-6 text-quali-primary mb-4" />
                  <p className="text-5xl font-black text-white italic mb-1">{sectorCount}</p>
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sectors</h3>
                </div>
              </div>
              <div className="bg-white/5 rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
                <div className="px-12 py-10 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white italic">Recent Provisioning</h3>
                  <button onClick={() => setCurrentView('items')} className="text-[10px] font-black text-quali-primary uppercase tracking-[0.2em] hover:text-white transition-colors">See Complete Matrix \u2192</button>
                </div>
                <div className="divide-y divide-white/5">
                  {(menuItems || []).slice(0, 5).map(item => (
                    <div key={item.id} className="px-12 py-8 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex items-center space-x-6">
                        <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center text-quali-primary border border-white/10">
                          <Package className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-white italic tracking-tight">{item.name}</h4>
                          <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">\u20b1{item.basePrice} \u25cf {categories.find(cat => cat.id === item.category)?.name}</p>
                        </div>
                      </div>
                      <button onClick={() => handleEditItem(item)} className="p-4 bg-white/5 text-gray-400 hover:text-white rounded-xl border border-white/10 transition-all"><Edit className="h-5 w-5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentView === 'items' && (
            <div className="animate-fade-in space-y-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-10">
                <div>
                  <h2 className="text-5xl font-black text-white italic tracking-tighter mb-1">Fuel <span className="text-quali-primary">Inventory</span></h2>
                  <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">Master grid of dietary assets</p>
                </div>
                <button onClick={handleAddItem} className="bg-quali-gradient text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest border border-white/10 shadow-lg hover:scale-105 transition-all flex items-center space-x-3">
                  <Plus className="h-5 w-5" />
                  <span>Provision New</span>
                </button>
              </div>
              <div className="bg-white/5 rounded-[2.5rem] md:rounded-[3rem] border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px] lg:min-w-0">
                    <thead className="bg-white/[0.02] border-b border-white/10">
                      <tr>
                        <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Asset Name</th>
                        <th className="px-6 md:px-8 py-6 text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Sector</th>
                        <th className="px-6 md:px-8 py-6 text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Pricing</th>
                        <th className="px-6 md:px-8 py-6 text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                        <th className="px-6 md:px-10 py-6 text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(menuItems || []).map(item => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 md:px-10 py-6 md:py-8"><h4 className="text-white font-black italic uppercase tracking-tight text-sm md:text-base">{item.name}</h4></td>
                          <td className="px-6 md:px-8 py-6 md:py-8"><span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{categories.find(c => c.id === item.category)?.name}</span></td>
                          <td className="px-6 md:px-8 py-6 md:py-8"><span className="text-white font-black italic text-sm md:text-base">₱{item.basePrice}</span></td>
                          <td className="px-6 md:px-8 py-6 md:py-8"><span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${item.available ? 'text-quali-primary' : 'text-red-500'}`}>{item.available ? 'Ready' : 'Offline'}</span></td>
                          <td className="px-6 md:px-10 py-6 md:py-8 text-right space-x-2 md:space-x-4 whitespace-nowrap">
                            <button onClick={() => handleEditItem(item)} className="p-2.5 md:p-3 bg-white/5 text-quali-primary hover:bg-quali-primary hover:text-white rounded-xl transition-all border border-quali-primary/20"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleDeleteItem(item.id)} className="p-2.5 md:p-3 bg-white/5 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"><Trash2 className="h-4 w-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {(currentView === 'add' || currentView === 'edit') && (
            <div className="animate-fade-in space-y-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-10">
                <div className="flex items-center space-x-6">
                  <button onClick={() => setCurrentView('items')} className="p-4 bg-white/5 text-white rounded-2xl border border-white/10 hover:bg-white/10 transition-all"><ArrowLeft className="h-6 w-6" /></button>
                  <div>
                    <h2 className="text-5xl font-black text-white italic tracking-tighter mb-1">{currentView === 'add' ? 'Provision' : 'Refuel'} <span className="text-quali-primary">Asset</span></h2>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">Configure dietary specifications</p>
                  </div>
                </div>
                <button onClick={handleSaveItem} disabled={isProcessing} className="bg-quali-gradient text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest border border-white/10 shadow-lg hover:scale-105 transition-all flex items-center space-x-3">{isProcessing ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : <Save className="h-5 w-5" />}<span>{isProcessing ? 'Processing' : 'Commit Changes'}</span></button>
              </div>
              <div className="bg-white/5 p-12 rounded-[3.5rem] border border-white/10 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Identity Matrix</label>
                    <input type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:ring-2 focus:ring-quali-primary/50" placeholder="Asset Name" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Base Value (\u20b1)</label>
                    <input type="number" value={formData.basePrice || ''} onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:ring-2 focus:ring-quali-primary/50" placeholder="0" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Sector Allocation</label>
                    <select value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white focus:ring-2 focus:ring-quali-primary/50" title="Select Category">
                      {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-quali-dark">{cat.name}</option>)}
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
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Flavor Variations</label>
                      <button onClick={addVariation} className="p-2 bg-quali-primary/10 text-quali-primary rounded-lg hover:bg-quali-primary/20 transition-all border border-quali-primary/20 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest"><Plus className="h-3 w-3" /><span>Add Var</span></button>
                    </div>
                    <div className="space-y-3">
                      {formData.variations?.map((v, i) => (
                        <div key={v.id} className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl border border-white/10">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 group border border-white/10 cursor-pointer">
                            {v.image ? (
                              <img src={v.image} className="w-full h-full object-cover" alt="Variation" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500">
                                <ImageIcon className="h-4 w-4" />
                              </div>
                            )}
                            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white hover:text-quali-primary">
                              <Upload className="h-4 w-4" />
                              <input type="file" accept="image/*" onChange={(e) => handleVariationImageUpload(i, e)} className="hidden" />
                            </label>
                          </div>
                          <input type="text" value={v.name} onChange={(e) => updateVariation(i, 'name', e.target.value)} className="flex-1 bg-transparent border-none text-white text-xs focus:ring-0 px-2" placeholder="Variant Name" />
                          <input type="number" value={v.price} onChange={(e) => updateVariation(i, 'price', Number(e.target.value))} className="w-20 bg-transparent border-none text-white text-xs focus:ring-0 text-right pr-2" placeholder="\u20b1" />
                          <button onClick={() => removeVariation(i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add-ons */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Optional Add-ons</label>
                      <button onClick={addAddOn} className="p-2 bg-quali-secondary/10 text-quali-secondary rounded-lg hover:bg-quali-secondary/20 transition-all border border-quali-secondary/20 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest"><Plus className="h-3 w-3" /><span>Add Extra</span></button>
                    </div>
                    <div className="space-y-3">
                      {formData.addOns?.map((a, i) => (
                        <div key={a.id} className="flex items-center space-x-3 bg-white/5 p-3 rounded-xl border border-white/10">
                          <input type="text" value={a.name} onChange={(e) => updateAddOn(i, 'name', e.target.value)} className="flex-1 bg-transparent border-none text-white text-xs focus:ring-0" placeholder="Add-on Name" />
                          <input type="number" value={a.price} onChange={(e) => updateAddOn(i, 'price', Number(e.target.value))} className="w-20 bg-transparent border-none text-white text-xs focus:ring-0" placeholder="\u20b1" />
                          <button onClick={() => removeAddOn(i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'categories' && <div className="animate-fade-in"><CategoryManager onBack={() => setCurrentView('dashboard')} /></div>}
          {currentView === 'payments' && <div className="animate-fade-in"><PaymentMethodManager onBack={() => setCurrentView('dashboard')} /></div>}
          {currentView === 'settings' && <div className="animate-fade-in"><SiteSettingsManager /></div>}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;