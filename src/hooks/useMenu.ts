import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MenuItem } from '../types';
import { SAMPLE_PRODUCTS } from '../data/sampleProducts';

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      
      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          *,
          variations (*),
          add_ons (*)
        `)
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;

      const formattedItems: MenuItem[] = (items || []).map(item => {
        const now = new Date();
        const discountStart = item.discount_start_date ? new Date(item.discount_start_date) : null;
        const discountEnd = item.discount_end_date ? new Date(item.discount_end_date) : null;
        
        const isDiscountActive = item.discount_active && 
          (!discountStart || now >= discountStart) && 
          (!discountEnd || now <= discountEnd);
        
        const effectivePrice = isDiscountActive && item.discount_price ? item.discount_price : item.base_price;

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          basePrice: item.base_price,
          category: item.category,
          popular: item.popular,
          available: item.available ?? true,
          image: item.image_url || undefined,
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
            image: v.image || undefined
          })) || [],
          addOns: item.add_ons?.map((a: any) => ({
            id: a.id,
            name: a.name,
            price: a.price,
            category: a.category
          })) || []
        };
      });

      // Only show sample products if it's the first fetch and the database is truly empty
      // If items exist, or if we've already fetched before, don't revert to samples
      if (formattedItems.length === 0 && !items) {
        setMenuItems(SAMPLE_PRODUCTS);
      } else {
        setMenuItems(formattedItems);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      // Only use samples as fallback if we have no state at all
      setMenuItems(prev => prev.length === 0 ? SAMPLE_PRODUCTS : prev);
      setError(err instanceof Error ? err.message : 'Failed to fetch menu items');
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

      // 2. Insert variations sequentially to ensure we don't hit race conditions or bulk limits
      if (item.variations && item.variations.length > 0) {
        const { error: variationsError } = await supabase
          .from('variations')
          .insert(
            item.variations.map(v => ({
              menu_item_id: menuItem.id,
              name: v.name,
              price: v.price,
              image: v.image || null
            }))
          );

        if (variationsError) {
          console.error('DB Error inserting variations:', variationsError);
          // Optional: we could delete the menu item here to rollback, 
          // but for now we'll just throw so the user knows it failed partially
          throw new Error(`Variations insertion failed: ${variationsError.message}`);
        }
      }

      // 3. Insert add-ons
      if (item.addOns && item.addOns.length > 0) {
        const { error: addOnsError } = await supabase
          .from('add_ons')
          .insert(
            item.addOns.map(a => ({
              menu_item_id: menuItem.id,
              name: a.name,
              price: a.price,
              category: a.category || 'extras'
            }))
          );

        if (addOnsError) {
          console.error('DB Error inserting add-ons:', addOnsError);
          throw new Error(`Add-ons insertion failed: ${addOnsError.message}`);
        }
      }

      await fetchMenuItems();
      return menuItem;
    } catch (err) {
      console.error('Error in addMenuItem:', err);
      throw err;
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
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

      // 3. Update variations (Delete and Replace approach)
      if (updates.variations !== undefined) {
        const { error: delVarError } = await supabase.from('variations').delete().eq('menu_item_id', id);
        if (delVarError) console.warn('Warning: Failed to clear old variations:', delVarError);

        if (updates.variations.length > 0) {
          const { error: insVarError } = await supabase
            .from('variations')
            .insert(
              updates.variations.map(v => ({
                menu_item_id: id,
                name: v.name,
                price: v.price,
                image: v.image || null
              }))
            );
          if (insVarError) throw new Error(`Failed to insert new variations: ${insVarError.message}`);
        }
      }

      // 4. Update add-ons
      if (updates.addOns !== undefined) {
        const { error: delAddError } = await supabase.from('add_ons').delete().eq('menu_item_id', id);
        if (delAddError) console.warn('Warning: Failed to clear old add-ons:', delAddError);

        if (updates.addOns.length > 0) {
          const { error: insAddError } = await supabase
            .from('add_ons')
            .insert(
              updates.addOns.map(a => ({
                menu_item_id: id,
                name: a.name,
                price: a.price,
                category: a.category || 'extras'
              }))
            );
          if (insAddError) throw new Error(`Failed to insert new add-ons: ${insAddError.message}`);
        }
      }

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