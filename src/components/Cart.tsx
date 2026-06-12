import React from 'react';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Zap, CreditCard } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getSubtotal: () => number;
  onContinueShopping: () => void;
  onCheckout: () => void;
  appliedVoucher?: {
    code: string;
    discount_percent: number;
    discount_amount: number;
  } | null;
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getTotalPrice,
  getSubtotal,
  onContinueShopping,
  onCheckout,
  appliedVoucher
}) => {
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 lg:py-40 animate-fade-in">
        <div className="text-center py-24 bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5 -rotate-12">
             <ShoppingBag size={300} />
          </div>
          <div className="text-8xl mb-8 transform hover:scale-110 transition-transform cursor-default">🥗</div>
          <h2 className="text-5xl font-black text-white tracking-tighter mb-4 uppercase font-pretendard">
            <span className="text-white">Your </span>
            <span className="text-quali-primary">Cart </span>
            <span className="text-white text-3xl">is Empty</span>
          </h2>
          <p className="text-gray-500 mb-12 text-sm font-black tracking-[0.4em]">Fuel your day with high-performance nutrition</p>
          <button
            onClick={onContinueShopping}
            className="bg-quali-gradient text-white px-12 py-6 rounded-2xl hover:shadow-[0_0_40px_rgba(154,202,60,0.3)] transition-all duration-300 font-black uppercase tracking-widest text-sm transform hover:scale-105 border border-white/10 shadow-xl"
          >
            Start Refueling
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-24 lg:py-32 animate-fade-in text-pretendard">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 md:mb-16 gap-6 md:gap-8">
        <button
          onClick={onContinueShopping}
          className="group flex items-center space-x-3 text-gray-500 hover:text-white transition-all font-black uppercase tracking-widest text-[9px] md:text-[10px]"
        >
          <div className="p-2.5 md:p-3 bg-white/5 rounded-xl border border-white/10 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
             <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <span>Back to Menu</span>
        </button>
        
        <div className="text-center order-first md:order-none">
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-1 font-pretendard">
             <span className="text-white">Your </span>
             <span className="text-quali-primary">Cart</span>
           </h1>
           <p className="text-[10px] font-black text-gray-500 tracking-[0.4em]">Review your selections</p>
        </div>

        <button
          onClick={clearCart}
          className="text-red-500/50 hover:text-red-500 transition-all font-black uppercase tracking-widest text-[9px] md:text-[10px] border border-red-500/10 hover:border-red-500/30 px-5 md:px-6 py-2.5 md:py-3 rounded-full hover:bg-red-500/5 hidden xs:block"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 mb-16">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden divide-y divide-white/5">
            {cartItems.map((item) => (
                <div key={item.id} className="p-6 md:p-8 group hover:bg-white/[0.02] transition-all">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-6 sm:space-y-0 sm:space-x-8">
                    {/* Image Container */}
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-[1.5rem] overflow-hidden bg-white/5 border border-white/10 relative z-10">
                        {item.selectedVariation?.image ? (
                          <img 
                            src={item.selectedVariation.image} 
                            alt={item.selectedVariation.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl opacity-30 grayscale group-hover:grayscale-0 transition-all">
                            🥗
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <h3 className="text-lg md:text-xl font-black text-white italic tracking-tight group-hover:text-quali-primary transition-colors mb-1">{item.name}</h3>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                         {item.selectedVariations?.length ? item.selectedVariations.map(v => (
                            <span key={v.id} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-gray-400 tracking-widest">{v.name}</span>
                         )) : item.selectedVariation ? (
                            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-gray-400 tracking-widest">{item.selectedVariation.name}</span>
                         ) : null}
                         {item.selectedAddOns?.map(addOn => (
                            <span key={addOn.id} className="px-2 py-0.5 bg-quali-primary/10 border border-quali-primary/20 rounded-lg text-[8px] font-black text-quali-primary tracking-widest">+ {addOn.name}</span>
                         ))}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center space-x-3 bg-black/40 rounded-xl md:rounded-2xl p-1 border border-white/10 shadow-inner">
                          <button
                            title="Decrease quantity"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg md:rounded-xl transition-all border border-white/5 text-quali-primary"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-black text-white tabular-nums tracking-tighter min-w-[30px] text-center">{item.quantity}</span>
                          <button
                            title="Increase quantity"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg md:rounded-xl transition-all border border-white/5 text-quali-primary"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-4 md:space-x-6">
                          <div className="text-right">
                            <span className="text-[8px] md:text-[10px] font-black text-gray-500 tracking-widest block mb-0.5">Item Total</span>
                            <span className="text-xl md:text-2xl font-black text-white italic tracking-tighter">₱{(item.totalPrice * item.quantity).toFixed(2)}</span>
                          </div>
                          
                          <button
                            title="Remove item"
                            onClick={() => removeFromCart(item.id)}
                            className="p-2.5 md:p-3 bg-red-500/5 border border-red-500/10 rounded-xl md:rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                          >
                            <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 border border-white/10 shadow-2xl sticky top-32">
             <div className="flex items-center space-x-4 mb-8 md:mb-10">
                <div className="p-3 bg-quali-primary/10 rounded-2xl border border-quali-primary/20">
                   <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-quali-primary" />
                </div>
                <div>
                   <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">Summary</h2>
                   <p className="text-[9px] font-black text-gray-500 tracking-widest">Price Breakdown</p>
                </div>
             </div>

             <div className="space-y-4 md:space-y-6 mb-8 md:mb-10">
                <div className="flex items-center justify-between text-xs md:text-sm">
                   <span className="font-black text-gray-500 tracking-widest italic">Subtotal</span>
                   <span className="font-black text-white">₱{getSubtotal().toFixed(2)}</span>
                </div>
                {appliedVoucher && (
                  <div className="flex items-center justify-between text-xs md:text-sm bg-quali-primary/10 -mx-4 px-4 py-2 rounded-lg border border-quali-primary/20">
                    <span className="font-black text-quali-primary tracking-widest italic flex items-center space-x-2">
                      <span>Discount ({appliedVoucher.code})</span>
                      <span className="bg-quali-primary/20 text-quali-primary px-1.5 py-0.5 rounded text-[8px] font-bold">
                        {appliedVoucher.discount_percent}%
                      </span>
                    </span>
                    <span className="font-black text-quali-primary">-₱{appliedVoucher.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs md:text-sm">
                   <span className="font-black text-gray-500 tracking-widest italic">Service Fee</span>
                   <span className="font-black text-quali-primary">TBD at Checkout</span>
                </div>
                <div className="h-[1px] bg-white/10 w-full" />
                <div className="flex items-center justify-between">
                   <span className="text-base md:text-lg font-black text-white italic uppercase tracking-tighter">Est. Total</span>
                   <span className="text-2xl md:text-3xl font-black text-quali-primary italic tracking-tighter">₱{getTotalPrice().toFixed(2)}</span>
                </div>
             </div>

             <button
               onClick={onCheckout}
               className="w-full bg-quali-gradient text-white py-5 md:py-6 rounded-2xl md:rounded-[2rem] hover:shadow-[0_0_40px_rgba(154,202,60,0.3)] transition-all duration-500 transform hover:scale-[1.02] font-black text-base md:text-lg uppercase tracking-[0.2em] shadow-2xl border border-white/20"
             >
               Checkout Now
             </button>
             
             <div className="mt-8 flex items-center justify-center space-x-2 text-[9px] md:text-[10px] font-black text-gray-600 tracking-widest italic">
                <Zap className="h-3 w-3" />
                <span>Secure Fuel Logistics</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;