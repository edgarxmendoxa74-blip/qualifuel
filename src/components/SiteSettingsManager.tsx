import React, { useState } from 'react';
import { Save, Upload, X, Loader, Settings as SettingsIcon, Edit as EditIcon, Layout as LayoutIcon, Image as ImageIcon } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useImageUpload } from '../hooks/useImageUpload';

const SiteSettingsManager: React.FC = () => {
  const { siteSettings, loading, updateSiteSettings } = useSiteSettings();
  const { uploadImage, uploading } = useImageUpload();
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroPreview, setHeroPreview] = useState<string>('');

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

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setHeroPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let logoUrl = logoPreview;
      let heroUrl = heroPreview;
      
      // Upload new logo if selected
      if (logoFile) {
        try {
          logoUrl = await uploadImage(logoFile);
        } catch (uploadError) {
          console.error('Logo upload error:', uploadError);
          alert(`\u274c Failed to upload logo.`);
          setIsSaving(false);
          return;
        }
      }

      // Upload new hero banner if selected
      if (heroFile) {
        try {
          heroUrl = await uploadImage(heroFile);
        } catch (uploadError) {
          console.error('Hero upload error:', uploadError);
          alert(`\u274c Failed to upload hero banner.`);
          setIsSaving(false);
          return;
        }
      }

      // Update all settings
      await updateSiteSettings({
        site_name: formData.site_name,
        site_description: formData.site_description,
        currency: formData.currency,
        currency_code: formData.currency_code,
        site_logo: logoUrl,
        hero_title: formData.hero_title,
        hero_subtitle: formData.hero_subtitle,
        hero_text: formData.hero_text,
        hero_banner: heroUrl
      });

      alert('\u2705 Site settings saved successfully!');
      setIsEditing(false);
      setLogoFile(null);
      setHeroFile(null);
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Error saving site settings:', error);
      alert(`\u274c Failed to save settings.`);
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
    setLogoFile(null);
    setHeroFile(null);
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
    <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] shadow-2xl p-12 lg:p-16 border border-white/10">
      {/* Saving Indicator */}
      {isSaving && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-quali-dark border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center space-y-6 shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-quali-primary border-t-transparent"></div>
            <div className="text-center">
              <p className="font-black text-white uppercase tracking-[0.2em] text-sm">Synchronizing Core Settings</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 italic">Please wait while we update your brand identity...</p>
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
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Master System Configuration</p>
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
        {/* Left Column: General Info */}
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-2">
              <ImageIcon className="h-4 w-4 text-quali-primary" />
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Master Brand Assets</h3>
            </div>
            
            {/* Logo Section */}
            <div className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/10 flex flex-col sm:flex-row items-center gap-10">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-white p-2 ring-4 ring-quali-primary/20 shadow-2xl flex-shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">\ud83e\udd57</div>
                )}
              </div>
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <h4 className="text-xl font-black text-white italic tracking-tight uppercase">Corporate Logo</h4>
                {isEditing && (
                  <div>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-upload" disabled={isSaving || uploading} />
                    <label htmlFor="logo-upload" className="inline-flex bg-quali-primary/10 text-quali-primary px-6 py-3 rounded-xl hover:bg-quali-primary/20 transition-all cursor-pointer border border-quali-primary/20 font-black text-[10px] uppercase tracking-widest">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New
                    </label>
                  </div>
                )}
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Recommeded: PNG / SVG with transparency</p>
              </div>
            </div>

            {/* General Fields */}
            <div className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Business Name</label>
                {isEditing ? (
                  <input type="text" name="site_name" value={formData.site_name} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm font-bold" />
                ) : (
                  <p className="text-2xl font-black text-white italic tracking-tight">{siteSettings?.site_name}</p>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Site Tagline</label>
                {isEditing ? (
                  <textarea name="site_description" value={formData.site_description} onChange={handleInputChange} rows={3} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm font-bold" />
                ) : (
                  <p className="text-gray-400 font-bold text-sm leading-relaxed">{siteSettings?.site_description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Symbol</label>
                  {isEditing ? (
                    <input type="text" name="currency" value={formData.currency} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm font-bold text-center" />
                  ) : (
                    <p className="text-2xl font-black text-white">{siteSettings?.currency}</p>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">ISO Code</label>
                  {isEditing ? (
                    <input type="text" name="currency_code" value={formData.currency_code} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm font-bold text-center" />
                  ) : (
                    <p className="text-2xl font-black text-white">{siteSettings?.currency_code}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Settings */}
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-2">
              <LayoutIcon className="h-4 w-4 text-quali-secondary" />
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Hero Section Control</h3>
            </div>

            {/* Banner Section */}
            <div className="bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/10 space-y-6">
              <div className="relative h-48 rounded-[2rem] overflow-hidden border border-white/10 shadow-xl group">
                <img src={heroPreview || "/images/qualifuel-banner.png"} alt="Hero Banner" className="w-full h-full object-cover" />
                
                {isEditing ? (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all flex flex-col items-center justify-center">
                    <input type="file" accept="image/*" onChange={handleHeroChange} className="hidden" id="hero-upload" disabled={isSaving || uploading} />
                    <label htmlFor="hero-upload" className="bg-quali-primary text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer hover:scale-105 transition-transform shadow-[0_0_20px_rgba(154,202,60,0.4)]">
                      Upload New Banner
                    </label>
                    <p className="text-white/70 font-bold uppercase tracking-widest text-[8px] mt-4">Click to select new image file</p>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center pointer-events-none">
                    {/* Hover state for non-editing mode - just to show it's interactive if they click Edit later */}
                    <span className="bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-white/20">Active Banner</span>
                  </div>
                )}
              </div>
              <div className="space-y-3 text-center">
                <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Hero Banner Image</h4>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Aspect Ratio: 16:9 or 21:9 Recommended</p>
              </div>
            </div>

            {/* Hero Content Fields */}
            <div className="bg-white/[0.02] p-10 rounded-[2.5rem] border border-white/10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-[#9ACA3C]">Hero Primary Title</label>
                {isEditing ? (
                  <input type="text" name="hero_title" value={formData.hero_title} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm font-bold" />
                ) : (
                  <p className="text-xl font-black text-white italic">{siteSettings?.hero_title}</p>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-[#9ACA3C]">Hero Subtitle</label>
                {isEditing ? (
                  <input type="text" name="hero_subtitle" value={formData.hero_subtitle} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm font-bold" />
                ) : (
                  <p className="text-xl font-black text-white italic">{siteSettings?.hero_subtitle}</p>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-[#9ACA3C]">Banner Overlay Text</label>
                {isEditing ? (
                  <input type="text" name="hero_text" value={formData.hero_text} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-quali-primary/50 text-sm font-bold" />
                ) : (
                  <p className="text-xl font-black text-white italic">{siteSettings?.hero_text}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteSettingsManager;
