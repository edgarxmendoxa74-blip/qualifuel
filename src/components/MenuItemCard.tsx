import React, { useState } from 'react';
import { Plus, Minus, X, ShoppingCart } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity?: number, variation?: Variation, addOns?: AddOn[], variations?: Variation[]) => void;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = React.memo(({ 
  item, 
  onAddToCart, 
  quantity, 
  onUpdateQuantity 
}) => {
  const { siteSettings } = useSiteSettings();
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | undefined>(
    item.variations?.[0]
  );
  const [selectedVariations, setSelectedVariations] = useState<Variation[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<(AddOn & { quantity: number })[]>([]);
  
  // Detect how many flavors can be picked from description
  const detectMaxFlavors = (description: string): number => {
    const lowerDesc = description.toLowerCase();
    // Match patterns like "pick 2 flavors", "choose 2 flavors", "2 flavors"
    const match = lowerDesc.match(/(?:pick|choose|select)?\s*(\d+)\s*flavors?/);
    if (match) {
      return parseInt(match[1]);
    }
    return 1; // Default to 1 flavor
  };
  
  const maxFlavors = item.maxFlavors || detectMaxFlavors(item.description);

  const calculatePrice = () => {
    // Use effective price (discounted or regular) as base
    let price = item.effectivePrice || item.basePrice;
    
    // For multiple flavors, use the highest priced variation
    if (maxFlavors > 1 && selectedVariations.length > 0) {
      const maxVariationPrice = Math.max(...selectedVariations.map(v => v.price));
      price = (item.effectivePrice || item.basePrice) + maxVariationPrice;
    } else if (selectedVariation) {
      price = (item.effectivePrice || item.basePrice) + selectedVariation.price;
    }
    
    selectedAddOns.forEach(addOn => {
      price += addOn.price * addOn.quantity;
    });
    return price;
  };
  
  const toggleVariationSelection = (variation: Variation) => {
    setSelectedVariations(prev => {
      const isSelected = prev.find(v => v.id === variation.id);
      if (isSelected) {
        // Remove if already selected
        return prev.filter(v => v.id !== variation.id);
      } else if (prev.length < maxFlavors) {
        // Add if under limit
        return [...prev, variation];
      }
      return prev; // At limit, don't add
    });
  };

  const handleAddToCart = () => {
    if (item.variations?.length || item.addOns?.length) {
      setShowCustomization(true);
    } else {
      onAddToCart(item, 1);
    }
  };

  const handleCustomizedAddToCart = () => {
    // Convert selectedAddOns back to regular AddOn array for cart
    const addOnsForCart: AddOn[] = selectedAddOns.flatMap(addOn => 
      Array(addOn.quantity).fill({ ...addOn, quantity: undefined })
    );
    
    // Pass multiple flavors if selected, otherwise single flavor
    if (maxFlavors > 1 && selectedVariations.length > 0) {
      onAddToCart(item, 1, selectedVariations[0], addOnsForCart, selectedVariations);
    } else {
      onAddToCart(item, 1, selectedVariation, addOnsForCart);
    }
    
    setShowCustomization(false);
    setSelectedAddOns([]);
    setSelectedVariations([]);
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onUpdateQuantity(item.id, quantity - 1);
    }
  };

  const updateAddOnQuantity = (addOn: AddOn, quantity: number) => {
    setSelectedAddOns(prev => {
      const existingIndex = prev.findIndex(a => a.id === addOn.id);
      
      if (quantity === 0) {
        // Remove add-on if quantity is 0
        return prev.filter(a => a.id !== addOn.id);
      }
      
      if (existingIndex >= 0) {
        // Update existing add-on quantity
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity };
        return updated;
      } else {
        // Add new add-on with quantity
        return [...prev, { ...addOn, quantity }];
      }
    });
  };

  const groupedAddOns = item.addOns?.reduce((groups, addOn) => {
    const category = addOn.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(addOn);
    return groups;
  }, {} as Record<string, AddOn[]>);

  return (
    <>
      <div className={`bg-white/5 backdrop-blur-sm rounded-[2.5rem] shadow-xl hover:shadow-quali-primary/10 transition-all duration-500 overflow-hidden group animate-scale-in border border-white/10 ${!item.available ? 'opacity-40' : ''}`}>
        {/* Image Container with Badges */}
        <div className="relative aspect-square w-full bg-white/5">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              fetchpriority={item.popular ? "high" : "auto"}
              onError={(e) => {
                const logo = siteSettings?.site_logo || '/logo.jpg';
                if (e.currentTarget.src !== logo) {
                  e.currentTarget.src = logo;
                  e.currentTarget.className = "w-full h-full object-contain p-8 opacity-20";
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-10">
               <img src={siteSettings?.site_logo || "/logo.jpg"} alt="Logo" className="w-32 h-32 object-contain" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {item.isOnDiscount && item.discountPrice && (
              <div className="bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg animate-pulse uppercase tracking-[0.2em]">
                SALE
              </div>
            )}
            {item.popular && (
              <div className="bg-quali-gradient text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg uppercase tracking-[0.2em]">
                BEST SELLER
              </div>
            )}
          </div>
          
          {!item.available && (
            <div className="absolute top-4 right-4 bg-gray-800/80 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg uppercase tracking-[0.2em]">
              SOLD OUT
            </div>
          )}
          
          {/* Discount Percentage Badge */}
          {item.isOnDiscount && item.discountPrice && (
            <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-full shadow-lg border border-white/20 uppercase tracking-[0.2em]">
              {Math.round(((item.basePrice - item.discountPrice) / item.basePrice) * 100)}% OFF
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-lg font-black text-white leading-tight flex-1 pr-2 uppercase tracking-tighter font-pretendard">
              {item.name}
            </h4>
          </div>
          

          

          
          {/* Pricing Section */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {item.isOnDiscount && item.discountPrice ? (
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 line-through font-black">
                    ₱{item.basePrice.toFixed(2)}
                  </span>
                  <span className="text-xl font-black text-quali-primary italic">
                    ₱{item.discountPrice.toFixed(2)}
                  </span>
                </div>
              ) : (
                <div className="text-xl font-black text-white italic">
                  ₱{item.basePrice.toFixed(2)}
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex-shrink-0">
              {!item.available ? (
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest border border-gray-500/30 px-5 py-2.5 rounded-xl">
                  Inactive
                </div>
              ) : quantity === 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="bg-quali-gradient text-white px-5 py-3 rounded-xl hover:shadow-[0_0_30px_rgba(154,202,60,0.3)] transition-all duration-300 transform hover:scale-105 font-black text-[9px] uppercase tracking-widest border border-white/10 shadow-lg"
                >
                  {item.variations?.length || item.addOns?.length ? '✨ Custom' : '🛒 Add'}
                </button>
              ) : (
                <div className="flex items-center space-x-2 bg-white/5 rounded-xl p-1 border border-white/10 shadow-xl backdrop-blur-xl">
                  <button
                    onClick={handleDecrement}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all text-quali-primary"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-black text-white min-w-[24px] text-center text-sm">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all text-quali-primary"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {showCustomization && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-quali-dark rounded-[2.5rem] md:rounded-[3rem] max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 relative custom-scrollbar">
            <button
              title="Close"
              onClick={() => setShowCustomization(false)}
              className="absolute top-6 right-6 md:top-8 md:right-8 p-3 hover:bg-white/5 rounded-2xl transition-all text-gray-500 hover:text-white z-10"
            >
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            <div className="p-8 md:p-12">
              <div className="mb-10 md:mb-12">
                <p className="text-[10px] font-black text-quali-primary tracking-[0.4em] mb-2 text-center italic">Elite Fuel Selection</p>
                <h3 className="text-3xl md:text-4xl font-black text-white italic text-center leading-tight uppercase tracking-tighter">
                  {item.name}
                </h3>
              </div>

              {/* Flavor Variations */}
              {item.variations && item.variations.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-xs font-black text-white tracking-[0.2em] italic">
                      {maxFlavors > 1 ? `Pick ${maxFlavors} Options` : 'Step 1: Choose Source'}
                    </h4>
                    {maxFlavors > 1 && (
                      <span className="text-[10px] font-black text-quali-primary bg-quali-primary/10 px-3 py-1 rounded-full uppercase tracking-widest border border-quali-primary/20">
                        {selectedVariations.length}/{maxFlavors} picked
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {item.variations.map((variation) => {
                      const isSelected = maxFlavors > 1 
                        ? selectedVariations.find(v => v.id === variation.id)
                        : selectedVariation?.id === variation.id;
                      
                      return (
                        <button
                          key={variation.id}
                          onClick={() => {
                            if (maxFlavors > 1) {
                              toggleVariationSelection(variation);
                            } else {
                              setSelectedVariation(variation);
                            }
                          }}
                          className={`flex flex-col p-4 md:p-6 rounded-3xl border-2 transition-all text-left group ${
                            isSelected
                              ? 'border-quali-primary bg-quali-primary/5 shadow-[0_0_20px_rgba(154,202,60,0.1)]'
                              : 'border-white/5 bg-white/[0.02] hover:border-white/20'
                          }`}
                        >
                          {variation.image && (
                            <div className="w-full h-24 mb-4 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                              <img src={variation.image} alt={variation.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-2 w-full">
                             <span className={`text-sm font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                               {variation.name}
                             </span>
                             <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-quali-primary bg-quali-primary' : 'border-gray-600'}`}>
                               {isSelected && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                             </div>
                          </div>
                          {variation.price > 0 && (
                            <span className="text-quali-primary font-black italic text-sm">
                              +₱{variation.price.toFixed(2)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {groupedAddOns && Object.keys(groupedAddOns).length > 0 && (
                <div className="mb-12">
                   <h4 className="text-xs font-black text-white tracking-[0.2em] italic mb-6">Step 2: Boost Performance</h4>
                  {Object.entries(groupedAddOns).map(([category, addOns]) => (
                    <div key={category} className="mb-8">
                       <p className="text-[10px] font-black text-gray-500 tracking-widest mb-4 italic">{category.replace('-', ' ')}</p>
                      <div className="space-y-4">
                        {addOns.map((addOn) => (
                          <div
                            key={addOn.id}
                            className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:border-white/10 transition-all"
                          >
                            <div className="flex-1">
                              <span className="text-sm font-black text-white uppercase tracking-wider">{addOn.name}</span>
                              <div className="text-[10px] font-black text-gray-500 tracking-widest">
                                {addOn.price > 0 ? `₱${addOn.price.toFixed(2)} / unit` : 'Complementary'}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {selectedAddOns.find(a => a.id === addOn.id) ? (
                                <div className="flex items-center space-x-4 bg-white/5 rounded-2xl p-2 border border-white/10">
                                  <button
                                    title="Decrease quantity"
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 1) - 1);
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all text-quali-primary"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="font-black text-white min-w-[20px] text-center text-sm">
                                    {selectedAddOns.find(a => a.id === addOn.id)?.quantity || 0}
                                  </span>
                                  <button
                                    title="Increase quantity"
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 0) + 1);
                                    }}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all text-quali-primary"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => updateAddOnQuantity(addOn, 1)}
                                  className="px-6 py-3 bg-white/5 rounded-2xl hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all"
                                >
                                  Add to fuel
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Summary & Action */}
              <div className="bg-quali-primary/10 border border-quali-primary/20 rounded-[2rem] p-10 mt-12">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-black text-gray-500 tracking-widest italic">Total Investment</span>
                  <span className="text-4xl font-black text-white italic tracking-tighter">₱{calculatePrice().toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCustomizedAddToCart}
                  disabled={maxFlavors > 1 && selectedVariations.length !== maxFlavors}
                  className={`w-full py-6 rounded-2xl transition-all duration-300 font-black flex items-center justify-center space-x-3 shadow-xl uppercase tracking-[0.2em] text-xs border border-white/10 ${
                    maxFlavors > 1 && selectedVariations.length !== maxFlavors
                      ? 'bg-white/5 text-gray-500 cursor-not-allowed border-transparent'
                      : 'bg-quali-gradient text-white hover:shadow-[0_0_50px_rgba(154,202,60,0.2)] transform hover:scale-[1.02]'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>
                    {maxFlavors > 1 && selectedVariations.length !== maxFlavors
                      ? `Select ${maxFlavors} Flavors`
                      : `Commit to Cart`
                    }
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

MenuItemCard.displayName = 'MenuItemCard';

export default MenuItemCard;