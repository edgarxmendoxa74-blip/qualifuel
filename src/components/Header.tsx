import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick, onMenuClick }) => {
  const { siteSettings, loading } = useSiteSettings();

  return (
    <>
      {/* Qualifuel Header */}
      <header className="sticky top-0 z-50 bg-quali-dark backdrop-blur-md border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <button 
              onClick={onMenuClick}
              className="flex items-center space-x-3 text-white hover:text-quali-primary transition-all duration-300 group"
            >
              {loading ? (
                <div className="h-10 w-10 bg-white/10 rounded-full animate-pulse" />
              ) : (
                <div className="relative">
                  <div className="absolute -inset-1 bg-quali-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-quali-dark p-0.5 rounded-full border border-white/10 group-hover:border-quali-primary transition-colors duration-300">
                    <img 
                      src={siteSettings?.site_logo || "/logo.jpg"} 
                      alt="Qualifuel"
                      className="h-9 w-9 md:h-11 md:w-11 object-contain rounded-full"
                      onError={(e) => { e.currentTarget.src = "/logo.jpg"; }}
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col text-left">
                <h1 className="text-lg md:text-2xl font-black tracking-tighter leading-none italic uppercase">
                  {loading ? (
                    <div className="w-20 h-5 bg-white/10 rounded animate-pulse" />
                  ) : (
                    siteSettings?.site_name || "QualiFuel"
                  )}
                </h1>
                <p className="text-[7px] md:text-[9px] font-bold text-quali-secondary tracking-[0.15em] uppercase mt-0.5 hidden xs:block">
                  {siteSettings?.site_description || "High Protein Meals"}
                </p>
              </div>
            </button>

            <div className="flex items-center">
              <button 
                onClick={onCartClick}
                className="relative px-5 py-2.5 md:px-7 md:py-3 bg-quali-gradient text-white rounded-2xl transition-all duration-300 shadow-lg flex items-center space-x-2 font-black text-[9px] md:text-[11px] uppercase tracking-widest border border-white/10 hover:scale-105 active:scale-95"
              >
                <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden xs:inline">Cart</span>
                {cartItemsCount > 0 && (
                  <span className="bg-white text-quali-primary text-[9px] md:text-[11px] font-black rounded-lg px-1.5 md:px-2 py-0.5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;