import React, { useState } from 'react';
import { Save, X, Loader, Settings as SettingsIcon, Edit as EditIcon, Layout as LayoutIcon, Image as ImageIcon } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useImageUpload } from '../hooks/useImageUpload';
import ImageUpload from './ImageUpload';
import Toast, { ToastType } from './Toast';

const SiteSettingsManager: React.FC = () => {
  const { siteSettings, loading, updateSiteSettings } = useSiteSettings();
  const { uploading } = useImageUpload();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    site_name: '',
    site_description: '',
    currency: '',
    currency_code: '',
    hero_title: '',
    hero_subtitle: '',
    hero_text: ''
  });
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [heroPreview, setHeroPreview] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  React.useEffect(() => {
    if (siteSettings) {
      setFormData({
        site_name: siteSettings.site_name,
        site_description: siteSettings.site_description,
        currency: siteSettings.currency,
        currency_code: siteSettings.currency_code,
        hero_title: siteSettings.hero_title,
        hero_subtitle: siteSettings.hero_subtitle,
        hero_text: siteSettings.hero_text
      });
      setLogoPreview(siteSettings.site_logo);
      setHeroPreview(siteSettings.hero_banner);
    }
  }, [siteSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSiteSettings({
        ...formData,
        site_logo: logoPreview,
        hero_banner: heroPreview
      });
      setIsEditing(false);
      showToast('Global configurations synchronized');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (siteSettings) {
      setFormData({
        site_name: siteSettings.site_name,
        site_description: siteSettings.site_description,
        currency: siteSettings.currency,
        currency_code: siteSettings.currency_code,
        hero_title: siteSettings.hero_title,
        hero_subtitle: siteSettings.hero_subtitle,
        hero_text: siteSettings.hero_text
      });
      setLogoPreview(siteSettings.site_logo);
      setHeroPreview(siteSettings.hero_banner);
    }
    setIsEditing(false);

  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-12 lg:p-16 border border-white/10 animate-pulse">
        <div className="h-12 bg-white/5 rounded-2xl w-1/4 mb-12"></div>
        <div className="space-y-8">
          <div className="h-32 bg-white/5 rounded-3xl w-full"></div>
          <div className="h-32 bg-white/5 rounded-3xl w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in text-pretendard">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] shadow-2xl p-12 lg:p-16 border border-white/10">
        {isSaving && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-quali-dark border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center space-y-6 shadow-2xl">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-quali-primary border-t-transparent"></div>
              <div className="text-center">
                <p className="font-black text-white tracking-[0.2em] text-sm">Synchronizing Core Settings</p>
                <p className="text-[10px] text-gray-500 font-bold tracking-widest mt-2 italic">Please wait while we update your brand identity...</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-16 gap-8">
          <div className="flex items-center space-x-6">
            <div className="bg-quali-primary/10 p-5 rounded-[1.5rem] border border-quali-primary/30">
              <SettingsIcon className="h-8 w-8 text-quali-primary" />
            </div>
            <div>
              <h2 className="text-5xl font-black text-white tracking-tighter mb-1 font-pretendard">
                <span className="text-white">Brand </span>
                <span className="text-quali-primary">Identity</span>
              </h2>
              <p className="text-[10px] font-black text-gray-500 tracking-[0.4em]">Master System Configuration</p>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-quali-gradient text-white px-10 py-5 rounded-[1.5rem] hover:scale-105 transition-all duration-300 flex items-center space-x-3 font-black uppercase tracking-widest text-xs border border-white/10 shadow-lg"
            >
              <EditIcon className="h-5 w-5" />
              <span>Modify Settings</span>
            </button>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="bg-white/5 text-white px-8 py-5 rounded-[1.5rem] hover:bg-white/10 transition-all duration-200 flex items-center space-x-3 disabled:opacity-30 font-black uppercase tracking-widest text-xs border border-white/10"
              >
                <X className="h-5 w-5" />
                <span>Abort</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || uploading}
                className="bg-quali-gradient text-white px-10 py-5 rounded-[1.5rem] hover:shadow-[0_0_40px_rgba(154,202,60,0.3)] transition-all duration-300 flex items-center space-x-3 font-black uppercase tracking-widest text-xs border border-white/10 disabled:opacity-30 shadow-lg"
              >
                {isSaving || uploading ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>{uploading ? 'Uploading...' : 'Syncing...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Commit Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                <ImageIcon className="h-4 w-4 text-quali-primary" />
                <h3 className="text-[10px] font-black text-gray-400 tracking-[0.3em]">Master Brand Assets</h3>
              </div>
              
              <div className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/10">
                <div className="flex flex-col sm:flex-row items-center gap-10 mb-8">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-white ring-4 ring-quali-primary/20 shadow-2xl flex-shrink-0 relative group">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🥗</div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h4 className="text-xl font-black text-white italic tracking-tight">Corporate Logo</h4>
                    <p className="text-[9px] text-gray-500 font-bold tracking-widest">Recommended: 512x512px • PNG / SVG with transparency</p>
                  </div>
                </div>
                
                {isEditing && (
                  <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                    <ImageUpload 
                      currentImage={logoPreview} 
                      onImageChange={(imageUrl) => {
                        setLogoPreview(imageUrl || '');

                      }} 
                    />
                  </div>
                )}
              </div>

              <div className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 tracking-widest">Business Name</label>
                  {isEditing ? (
                    <input title="Business Name" type="text" name="site_name" value={formData.site_name} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm font-bold" />
                  ) : (
                    <p className="text-2xl font-black text-white italic tracking-tight">{siteSettings?.site_name}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 tracking-widest">Site Tagline</label>
                  {isEditing ? (
                    <textarea title="Site Tagline" name="site_description" value={formData.site_description} onChange={handleInputChange} rows={3} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm font-bold" />
                  ) : (
                    <p className="text-gray-400 font-bold text-sm leading-relaxed">{siteSettings?.site_description}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 tracking-widest">Symbol</label>
                    {isEditing ? (
                      <input title="Currency Symbol" type="text" name="currency" value={formData.currency} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm font-bold text-center" />
                    ) : (
                      <p className="text-2xl font-black text-white">{siteSettings?.currency}</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 tracking-widest">ISO Code</label>
                    {isEditing ? (
                      <input title="Currency ISO Code" type="text" name="currency_code" value={formData.currency_code} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm font-bold text-center" />
                    ) : (
                      <p className="text-2xl font-black text-white">{siteSettings?.currency_code}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-2">
                <LayoutIcon className="h-4 w-4 text-quali-secondary" />
                <h3 className="text-[10px] font-black text-gray-400 tracking-[0.3em]">Hero Section Control</h3>
              </div>

              <div className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/10 space-y-6">
                <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-xl group bg-white/5">
                  <img src={heroPreview || "/images/qualifuel-banner.png"} alt="Hero Banner" className="w-full h-auto block" />
                </div>
                
                <div className="space-y-3 text-center">
                  <h4 className="text-sm font-black text-white tracking-widest italic">Hero Banner Image</h4>
                  <p className="text-[9px] text-gray-500 font-bold tracking-widest">Standard size: 1920x1080px • Aspect Ratio: 16:9 or 21:9 Recommended</p>
                </div>

                {isEditing && (
                  <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                    <ImageUpload 
                      currentImage={heroPreview} 
                      onImageChange={(imageUrl) => {
                        setHeroPreview(imageUrl || '');

                      }} 
                    />
                  </div>
                )}
              </div>

              <div className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 tracking-widest text-[#9ACA3C]">Hero Primary Title</label>
                  {isEditing ? (
                    <input title="Hero Primary Title" type="text" name="hero_title" value={formData.hero_title} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm font-bold" />
                  ) : (
                    <p className="text-xl font-black text-white italic">{siteSettings?.hero_title}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 tracking-widest text-[#9ACA3C]">Hero Subtitle</label>
                  {isEditing ? (
                    <input title="Hero Subtitle" type="text" name="hero_subtitle" value={formData.hero_subtitle} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm font-bold" />
                  ) : (
                    <p className="text-xl font-black text-white italic">{siteSettings?.hero_subtitle}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 tracking-widest text-[#9ACA3C]">Banner Overlay Text</label>
                  {isEditing ? (
                    <input title="Banner Overlay Text" type="text" name="hero_text" value={formData.hero_text} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm font-bold" />
                  ) : (
                    <p className="text-xl font-black text-white italic">{siteSettings?.hero_text}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettingsManager;
