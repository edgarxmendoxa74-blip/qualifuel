import React, { useState } from 'react';
import { Ticket, X, Percent, AlertCircle, CheckCircle } from 'lucide-react';
import { useVouchers } from '../hooks/useVouchers';

interface VoucherInputProps {
  onVoucherApplied: (code: string, discount_percent: number) => void;
  onVoucherRemoved: () => void;
  appliedVoucher: {
    code: string;
    discount_percent: number;
    discount_amount: number;
  } | null;
  orderTotal: number;
  disabled?: boolean;
}

const VoucherInput: React.FC<VoucherInputProps> = ({
  onVoucherApplied,
  onVoucherRemoved,
  appliedVoucher,
  orderTotal,
  disabled = false
}) => {
  const { validateVoucherCode } = useVouchers();
  const [voucherCode, setVoucherCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim() || isValidating) return;

    try {
      setIsValidating(true);
      setError(null);

      const validation = await validateVoucherCode(voucherCode.trim());
      
      if (validation.is_valid) {
        onVoucherApplied(voucherCode.trim().toUpperCase(), validation.discount_percent);
        setVoucherCode('');
      } else {
        setError(validation.error_message);
      }
    } catch (error) {
      setError('Failed to validate voucher code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveVoucher = () => {
    onVoucherRemoved();
    setVoucherCode('');
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyVoucher();
    }
  };

  if (appliedVoucher) {
    return (
      <div className="bg-quali-primary/10 border border-quali-primary/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-quali-primary/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-quali-primary" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold font-mono tracking-wider">
                  {appliedVoucher.code}
                </span>
                <span className="bg-quali-primary text-black px-2 py-1 rounded text-xs font-bold">
                  {appliedVoucher.discount_percent}% OFF
                </span>
              </div>
              <p className="text-green-400 text-sm">
                Voucher applied! Save ₱{appliedVoucher.discount_amount.toFixed(2)}
              </p>
            </div>
          </div>
          {!disabled && (
            <button
              onClick={handleRemoveVoucher}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300"
              title="Remove voucher"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Ticket className="h-5 w-5 text-quali-primary" />
        <label className="text-white font-medium">Have a promo code?</label>
      </div>
      
      <div className="flex space-x-3">
        <div className="flex-1">
          <input
            type="text"
            value={voucherCode}
            onChange={(e) => {
              setVoucherCode(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Enter voucher code"
            disabled={disabled || isValidating}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-quali-primary font-mono tracking-wider uppercase"
            maxLength={20}
          />
        </div>
        <button
          onClick={handleApplyVoucher}
          disabled={!voucherCode.trim() || disabled || isValidating}
          className="bg-quali-gradient text-white px-4 py-2 rounded-lg hover:shadow-[0_0_20px_rgba(154,202,60,0.3)] transition-all font-medium disabled:opacity-50 disabled:hover:shadow-none flex items-center space-x-2"
        >
          {isValidating ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Percent className="h-4 w-4" />
          )}
          <span>{isValidating ? 'Checking...' : 'Apply'}</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        Enter your promo code to get instant discounts on your order
      </div>
    </div>
  );
};

export default VoucherInput;