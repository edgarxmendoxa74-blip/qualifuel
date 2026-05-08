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

      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('id, value');

      if (fetchError) throw fetchError;

      if (data) {
        const settingsMap: Record<string, string> = {};
        data.forEach((row: { id: string; value: string }) => {
          settingsMap[row.id] = row.value;
        });

        setSiteSettings({
          site_name: settingsMap.site_name || 'QualiFuel',
          site_logo: settingsMap.site_logo || '',
          site_description: settingsMap.site_description || '',
          currency: settingsMap.currency || '₱',
          currency_code: settingsMap.currency_code || 'PHP',
          hero_title: settingsMap.hero_title || 'QualiFuel',
          hero_subtitle: settingsMap.hero_subtitle || 'High Protein Meals',
          hero_text: settingsMap.hero_text || 'Fuel Your Potential.',
          hero_banner: settingsMap.hero_banner || '/images/qualifuel-banner.png'
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
      
      const upserts = Object.entries(updates).map(([key, value]) => ({
        id: key,
        value: value,
        updated_at: new Date().toISOString()
      }));

      const { error: updateError } = await supabase
        .from('site_settings')
        .upsert(upserts, { onConflict: 'id' });

      if (updateError) throw updateError;
      
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
