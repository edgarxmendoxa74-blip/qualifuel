import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Voucher, VoucherValidation, VoucherUsage } from '../types';

export const useVouchers = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVouchers(data || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const addVoucher = useCallback(async (voucherData: Omit<Voucher, 'id' | 'used_count' | 'created_at' | 'updated_at'>) => {
    try {
      // Check voucher limit before attempting to add
      if (vouchers.length >= 30) {
        throw new Error('Maximum voucher limit of 30 reached. Please delete existing vouchers to add new ones.');
      }
      
      const { data, error } = await supabase
        .from('vouchers')
        .insert([{
          ...voucherData,
          code: voucherData.code.toUpperCase(), // Ensure uppercase
          used_count: 0
        }])
        .select()
        .single();

      if (error) {
        // Handle database constraint error for voucher limit
        if (error.message.includes('Maximum voucher limit')) {
          throw new Error('Maximum voucher limit of 30 reached. Please delete existing vouchers to add new ones.');
        }
        throw error;
      }
      
      setVouchers(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding voucher:', error);
      throw error;
    }
  }, [vouchers.length]);

  const updateVoucher = useCallback(async (id: string, updates: Partial<Voucher>) => {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .update({
          ...updates,
          code: updates.code ? updates.code.toUpperCase() : undefined
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setVouchers(prev => prev.map(voucher => 
        voucher.id === id ? data : voucher
      ));
      return data;
    } catch (error) {
      console.error('Error updating voucher:', error);
      throw error;
    }
  }, []);

  const deleteVoucher = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('vouchers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setVouchers(prev => prev.filter(voucher => voucher.id !== id));
    } catch (error) {
      console.error('Error deleting voucher:', error);
      throw error;
    }
  }, []);

  const validateVoucherCode = useCallback(async (code: string): Promise<VoucherValidation> => {
    try {
      const { data, error } = await supabase
        .rpc('validate_voucher_code', { voucher_code: code });

      if (error) throw error;
      
      return data[0] || {
        is_valid: false,
        discount_percent: 0,
        error_message: 'Voucher validation failed',
        voucher_id: ''
      };
    } catch (error) {
      console.error('Error validating voucher:', error);
      return {
        is_valid: false,
        discount_percent: 0,
        error_message: error instanceof Error ? error.message : 'Validation error',
        voucher_id: ''
      };
    }
  }, []);

  const useVoucherCode = useCallback(async (
    code: string, 
    customerName?: string, 
    customerContact?: string, 
    orderTotal?: number
  ): Promise<VoucherUsage> => {
    try {
      const { data, error } = await supabase
        .rpc('use_voucher', {
          voucher_code: code,
          customer_name: customerName || null,
          customer_contact: customerContact || null,
          order_total: orderTotal || null
        });

      if (error) throw error;
      
      // Refresh vouchers to update used_count
      fetchVouchers();
      
      return data[0] || {
        success: false,
        message: 'Failed to use voucher',
        discount_amount: 0
      };
    } catch (error) {
      console.error('Error using voucher:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Usage error',
        discount_amount: 0
      };
    }
  }, [fetchVouchers]);

  return {
    vouchers,
    loading,
    error,
    addVoucher,
    updateVoucher,
    deleteVoucher,
    validateVoucherCode,
    useVoucherCode,
    refetchVouchers: fetchVouchers
  };
};