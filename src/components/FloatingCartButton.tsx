import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface FloatingCartButtonProps {
  itemCount: number;
  onCartClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ itemCount, onCartClick }) => {
  if (itemCount === 0) return null;

  return (
    <button
      onClick={onCartClick}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-full shadow-2xl hover:from-green-600 hover:to-green-700 hover:shadow-green-500/50 transition-all duration-200 transform hover:scale-110 z-40 md:hidden animate-bounce-gentle ring-4 ring-white"
    >
      <div className="relative">
        <ShoppingCart className="h-7 w-7" />
        <span className="absolute -top-2 -right-2 bg-white text-green-600 text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold ring-2 ring-green-400 animate-pulse shadow-md">
          {itemCount}
        </span>
      </div>
    </button>
  );
};

export default FloatingCartButton;