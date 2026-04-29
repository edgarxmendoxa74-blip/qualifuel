import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MenuItem } from '../types';
import { SAMPLE_PRODUCTS } from '../data/sampleProducts';

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // PHASE 1: Fetch metadata only (fast, no heavy blobs)
      const { data: metadata, error: metaError } = await supabase
        .from('menu_items')
        .select(`
          id, name, description, base_price, category, popular, available, 
          discount_price, discount_start_date, discount_end_date, discount_active,
          variations (*),
          add_ons (*)
        `)
        .order('created_at', { ascending: true });

      if (metaError) throw metaError;

      const formattedItems: MenuItem[] = (metadata || []).map(item => {
        const now = new Date();
        const discountStart = item.discount_start_date ? new Date(item.discount_start_date) : null;
        const discountEnd = item.discount_end_date ? new Date(item.discount_end_date) : null;
        
        const isDiscountActive = item.discount_active && 
          (!discountStart || now >= discountStart) && 
          (!discountEnd || now <= discountEnd);

        const effectivePrice = isDiscountActive && item.discount_price 
          ? Number(item.discount_price) 
          : Number(item.base_price);

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          basePrice: Number(item.base_price) || 0,
          category: item.category,
          popular: item.popular,
          available: item.available ?? true,
          image: undefined, 
          discountPrice: item.discount_price || undefined,
          discountStartDate: item.discount_start_date || undefined,
          discountEndDate: item.discount_end_date || undefined,
          discountActive: item.discount_active || false,
          effectivePrice,
          isOnDiscount: isDiscountActive,
          variations: item.variations?.map((v: any) => ({
            id: v.id,
            name: v.name,
            price: v.price,
            image: v.image
          })) || [],
          addOns: item.add_ons?.map((a: any) => ({
            id: a.id,
            name: a.name,
            price: a.price,
            category: a.category,
            image: a.image
          })) || []
        };
      });

      // Set initial items so the menu appears
      setMenuItems(formattedItems);

      // PHASE 2: Fetch images sequentially to prevent any 500 timeouts
      // This is the safest way to handle very large base64 strings
      const itemIds = formattedItems.map(item => item.id);
      
      for (const id of itemIds) {
        const { data: imageData, error: imageError } = await supabase
          .from('menu_items')
          .select('id, image_url')
          .eq('id', id)
          .single();

        if (!imageError && imageData) {
          setMenuItems(prev => prev.map(item => 
            item.id === id 
              ? { ...item, image: imageData.image_url || undefined } 
              : item
          ));
        }
      }

      setError(null);
    } catch (err: any) {
      console.error('Error in sequential fetch:', err);
      
      if ((err.code === '57014' || err.message?.includes('timeout')) && retryCount < 2) {
        setTimeout(() => fetchMenuItems(retryCount + 1), 2000);
        return;
      }
      
      setMenuItems(prev => prev.length === 0 ? SAMPLE_PRODUCTS : prev);
      setError(err instanceof Error ? err.message : 'Database synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    try {
      // 1. Insert the main menu item
      const itemData = {
        name: item.name,
        description: item.description,
        base_price: item.basePrice,
        category: item.category,
        popular: item.popular ?? false,
        available: item.available ?? true,
        image_url: item.image || null,
        discount_price: item.discountPrice || null,
        discount_start_date: item.discountStartDate || null,
        discount_end_date: item.discountEndDate || null,
        discount_active: item.discountActive ?? false
      };

      const { data: menuItem, error: itemError } = await supabase
        .from('menu_items')
        .insert(itemData)
        .select()
        .single();

      if (itemError) {
        console.error('DB Error inserting menu item:', itemError);
        throw new Error(`Item insertion failed: ${itemError.message}`);
      }

      if (!menuItem) throw new Error('No data returned after item insertion');

      // 2. Insert variations and add-ons in parallel
      const subItemPromises: Promise<any>[] = [];

      if (item.variations && item.variations.length > 0) {
        subItemPromises.push((async () => {
          const { error } = await supabase.from('variations').insert(
            item.variations!.map(v => ({ menu_item_id: menuItem.id, name: v.name, price: v.price }))
          );
          if (error) throw error;
        })());
      }

      if (item.addOns && item.addOns.length > 0) {
        subItemPromises.push((async () => {
          const { error } = await supabase.from('add_ons').insert(
            item.addOns!.map(a => ({ menu_item_id: menuItem.id, name: a.name, price: a.price, category: a.category || 'extras' }))
          );
          if (error) throw error;
        })());
      }

      await Promise.all(subItemPromises);
      await fetchMenuItems();
      return menuItem;
    } catch (err) {
      console.error('Error in addMenuItem:', err);
      throw err;
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      if (id.startsWith('sample-')) {
        throw new Error('Cannot update sample data. Please save as a new item.');
      }
      // 1. Prepare update object (only include defined fields to avoid accidental nulls)
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.basePrice !== undefined) updateData.base_price = updates.basePrice;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.popular !== undefined) updateData.popular = updates.popular;
      if (updates.available !== undefined) updateData.available = updates.available;
      if (updates.image !== undefined) updateData.image_url = updates.image || null;
      if (updates.discountPrice !== undefined) updateData.discount_price = updates.discountPrice || null;
      if (updates.discountStartDate !== undefined) updateData.discount_start_date = updates.discountStartDate || null;
      if (updates.discountEndDate !== undefined) updateData.discount_end_date = updates.discountEndDate || null;
      if (updates.discountActive !== undefined) updateData.discount_active = updates.discountActive;

      // 2. Perform the update
      const { error: itemError } = await supabase
        .from('menu_items')
        .update(updateData)
        .eq('id', id);

      if (itemError) {
        console.error('DB Error updating item basic info:', itemError);
        throw new Error(`Basic info update failed: ${itemError.message}`);
      }

      // 3. Update variations and add-ons in parallel
      const updatePromises: Promise<any>[] = [];

      if (updates.variations !== undefined) {
        updatePromises.push((async () => {
          await supabase.from('variations').delete().eq('menu_item_id', id);
          if (updates.variations!.length > 0) {
            const { error } = await supabase.from('variations').insert(
              updates.variations!.map(v => ({ menu_item_id: id, name: v.name, price: v.price }))
            );
            if (error) throw error;
          }
        })());
      }

      if (updates.addOns !== undefined) {
        updatePromises.push((async () => {
          await supabase.from('add_ons').delete().eq('menu_item_id', id);
          if (updates.addOns!.length > 0) {
            const { error } = await supabase.from('add_ons').insert(
              updates.addOns!.map(a => ({ menu_item_id: id, name: a.name, price: a.price, category: a.category || 'extras' }))
            );
            if (error) throw error;
          }
        })());
      }

      await Promise.all(updatePromises);
      
      // Perform fetch in background but return immediately if needed
      // Actually, we'll keep the await here but the individual parts are faster now.
      await fetchMenuItems();
    } catch (err) {
      console.error('Error in updateMenuItem:', err);
      throw err;
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      // Prevent attempts to delete sample data from the real database
      if (id.startsWith('sample-')) {
        setMenuItems(prev => prev.filter(item => item.id !== id));
        return;
      }

      // Basic UUID validation to prevent DB syntax errors
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        // If it's not a UUID and not a sample ID, it's likely a custom text ID
        // from early migrations (like 'artisan-ciabatta'). We'll try to delete it,
        // but it might fail if the column type is strictly UUID.
        console.warn(`Deleting item with non-standard ID format: ${id}`);
      }

      // Delete the menu item itself
      // Database has ON DELETE CASCADE for variations and add_ons, 
      // so we don't need to delete them manually here.
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      
      if (error) {
        console.error('Database delete error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      await fetchMenuItems();
    } catch (err) {
      console.error('Error deleting menu item:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  return {
    menuItems,
    loading,
    error,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    refetch: fetchMenuItems
  };
};