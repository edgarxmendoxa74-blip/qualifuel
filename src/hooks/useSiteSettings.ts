import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SiteSettings } from '../types';

export const useSiteSettings = () => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSiteSettings = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'global')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"

      if (data) {
        setSiteSettings({
          site_name: data.site_name || 'QualiFuel',
          site_logo: data.site_logo || '',
          site_description: data.site_description || '',
          currency: data.currency || '₱',
          currency_code: data.currency_code || 'PHP',
          hero_title: data.hero_title || 'QualiFuel',
          hero_subtitle: data.hero_subtitle || 'High Protein Meals',
          hero_text: data.hero_text || 'Fuel Your Potential.',
          hero_banner: data.hero_banner || '/images/qualifuel-banner.png'
        });
      }
    } catch (err: any) {
      console.error('Error fetching site settings:', err);
      
      if ((err.code === '57014' || err.message?.includes('timeout')) && retryCount < 2) {
        setTimeout(() => fetchSiteSettings(retryCount + 1), 1000);
        return;
      }
      
      setError(err instanceof Error ? err.message : 'Failed to fetch site settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSiteSettings = async (updates: Partial<SiteSettings>) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          id: 'global',
          ...updates 
        }, { onConflict: 'id' });

      if (error) throw error;
      await fetchSiteSettings();
    } catch (err) {
      console.error('Error updating site settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update site settings');
      throw err;
    }
  };

  useEffect(() => {
    fetchSiteSettings();
  }, []);

  return {
    siteSettings,
    loading,
    error,
    updateSiteSettings,
    refetch: fetchSiteSettings
  };
};
