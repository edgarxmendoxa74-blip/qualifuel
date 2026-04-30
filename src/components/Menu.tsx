import React from 'react';
import { MenuItem, CartItem } from '../types';
import { useCategories } from '../hooks/useCategories';
import { useSiteSettings } from '../hooks/useSiteSettings';
import MenuItemCard from './MenuItemCard';


// Removed Base64 image preloading to prevent main thread blocking
interface MenuProps {
  menuItems: MenuItem[];
  addToCart: (item: MenuItem, quantity?: number, variation?: any, addOns?: any[]) => void;
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  selectedCategory?: string;
}

const Menu: React.FC<MenuProps> = ({ menuItems, addToCart, cartItems, updateQuantity, selectedCategory = 'all' }) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const { siteSettings } = useSiteSettings();
  const [activeCategory, setActiveCategory] = React.useState('hot-coffee');

  // Memoize filtered categories to avoid unnecessary recalculations


  // Removed useEffect for preloading images to prevent blocking the main thread with heavy Base64 decodes.


  React.useEffect(() => {
    if (categories.length > 0) {
      // Set default to dim-sum if it exists, otherwise first category
      const defaultCategory = categories.find(cat => cat.id === 'dim-sum') || categories[0];
      if (!categories.find(cat => cat.id === activeCategory)) {
        setActiveCategory(defaultCategory.id);
      }
    }
  }, [categories, activeCategory]);

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = categories.map(cat => document.getElementById(cat.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveCategory(categories[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="mb-12 bg-quali-dark rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden relative min-h-[auto] lg:min-h-[400px] flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-12 md:px-10 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 items-center">
            
            {/* Left Content */}
            <div className="text-center lg:text-left animate-fade-in-left">

              
              <h2 className="text-5xl md:text-7xl xl:text-8xl font-pretendard font-black text-white mb-4 tracking-tighter leading-none uppercase">
                {siteSettings?.site_name === "QualiFuel" || !siteSettings?.site_name ? (
                  <>
                    <span className="text-white">Quali</span>
                    <span className="text-quali-primary">Fuel</span>
                  </>
                ) : (
                  siteSettings.site_name
                )}
              </h2>
              
              <p className="text-sm md:text-xl font-black text-quali-secondary tracking-[0.3em] mb-8">
                {siteSettings?.hero_subtitle || "High Protein Meals"}
              </p>

              <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
                <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl flex items-center space-x-4">
                  <div>
                    <h4 className="text-white font-black tracking-wider text-[10px] mb-0.5 whitespace-nowrap">Macro-Balanced</h4>
                    <p className="text-gray-400 text-[9px] font-medium leading-tight">Precisely calculated nutrients.</p>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl p-4 rounded-2xl flex items-center space-x-4">
                  <div>
                    <h4 className="text-white font-black tracking-wider text-[10px] mb-0.5 whitespace-nowrap">Performance Fuel</h4>
                    <p className="text-gray-400 text-[9px] font-medium leading-tight">Elite sustainable energy.</p>
                  </div>
                </div>
              </div>
              
              {/* Short Info */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-white/40 text-[9px] font-black tracking-widest pt-6 border-white/10">
                <span className="flex items-center">Mandaluyong</span>
                <span className="flex items-center">7AM - 12AM</span>
              </div>
            </div>

            {/* Right Content - Compact Hero Image */}
            <div className="relative group animate-fade-in-right">
              <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_0_60px_rgba(154,202,60,0.15)] bg-white/5">
                <img 
                  src={siteSettings?.hero_banner || "/images/qualifuel-banner.png"} 
                  alt="Qualifuel Performance Meals"
                  className="w-full h-auto block transform group-hover:scale-105 transition-transform duration-[3000ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {categoriesLoading ? (
        // Loading skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="flex justify-between items-center">
                  <div className="h-8 bg-gray-200 rounded w-24" />
                  <div className="h-10 bg-gray-200 rounded w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {categories.filter(category => selectedCategory === 'all' || category.id === selectedCategory).map((category) => {
            const categoryItems = menuItems.filter(item => item.category === category.id);
            if (categoryItems.length === 0) return null;
            
            return (
              <section key={category.id} id={category.id} className="mb-24 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b-2 border-white/5 pb-8 gap-6">
                  <div>
                    <h3 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
                      {category.name}
                    </h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                  {categoryItems.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAddToCart={addToCart}
                      quantity={cartItems.find(ci => ci.id === item.id)?.quantity || 0}
                      onUpdateQuantity={updateQuantity}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {/* Fallback for items with missing/invalid categories */}
          {menuItems.filter(item => !categories.some(c => c.id === item.category)).length > 0 && (
            <section id="uncategorized" className="mb-24 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b-2 border-white/5 pb-8 gap-6 text-gray-500">
                <div>
                  <h3 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
                    Other Provisions
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 opacity-80">
                {menuItems.filter(item => !categories.some(c => c.id === item.category)).map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={addToCart}
                    quantity={cartItems.find(ci => ci.id === item.id)?.quantity || 0}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
      </main>
    </>
  );
};

export default Menu;