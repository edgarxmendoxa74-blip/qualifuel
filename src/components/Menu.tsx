import React from 'react';
import { MenuItem, CartItem } from '../types';
import { useCategories } from '../hooks/useCategories';
import { useSiteSettings } from '../hooks/useSiteSettings';
import MenuItemCard from './MenuItemCard';
import MobileNav from './MobileNav';

// Preload images for better performance
const preloadImages = (items: MenuItem[]) => {
  items.forEach(item => {
    if (item.image) {
      const img = new Image();
      img.src = item.image;
    }
  });
};

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
  const filteredCategories = React.useMemo(() => {
    return categories.filter(category => selectedCategory === 'all' || category.id === selectedCategory);
  }, [categories, selectedCategory]);

  // Preload images when menu items change
  React.useEffect(() => {
    if (menuItems.length > 0) {
      // Preload images for visible category first
      const visibleItems = menuItems.filter(item => item.category === activeCategory);
      preloadImages(visibleItems);
      
      // Then preload other images after a short delay
      setTimeout(() => {
        const otherItems = menuItems.filter(item => item.category !== activeCategory);
        preloadImages(otherItems);
      }, 1000);
    }
  }, [menuItems, activeCategory]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(categoryId);
    if (element) {
      const headerHeight = 64; // Header height
      const mobileNavHeight = 60; // Mobile nav height
      const offset = headerHeight + mobileNavHeight + 20; // Extra padding
      const elementPosition = element.offsetTop - offset;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="text-center lg:text-left animate-fade-in-left">
              <div className="inline-block bg-quali-primary/10 border border-quali-primary/30 px-4 py-1.5 rounded-full mb-6 backdrop-blur-md">
                <span className="text-quali-primary font-black tracking-[0.2em] text-[8px] md:text-[10px]">
                  {siteSettings?.hero_title || "Mandaluyong's Premier Meal Prep"}
                </span>
              </div>
              
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
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
              <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_0_60px_rgba(154,202,60,0.15)] h-[250px] md:h-[350px]">
                <img 
                  src={siteSettings?.hero_banner || "/images/qualifuel-banner.png"} 
                  alt="Qualifuel Performance Meals"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[3000ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-6 left-6 right-6">
                  <h4 className="text-white font-black italic tracking-tight text-lg md:text-xl leading-tight">
                    {siteSettings?.hero_text || "Fuel Your Potential."}
                  </h4>
                </div>
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
        filteredCategories.map((category) => {
        const categoryItems = menuItems.filter(item => item.category === category.id);
        
        if (categoryItems.length === 0) return null;
        
        return (
          <section key={category.id} id={category.id} className="mb-16">
            {/* Hide category headers on mobile since they're in the sticky nav */}
            <div className="hidden md:flex items-center mb-8">
              <h3 className="text-3xl font-noto-kr font-medium text-black">{category.name}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoryItems.map((item) => {
                const cartItem = cartItems.find(cartItem => cartItem.id === item.id);
                return (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={addToCart}
                    quantity={cartItem?.quantity || 0}
                    onUpdateQuantity={updateQuantity}
                  />
                );
              })}
            </div>
          </section>
        );
      })
      )}
      </main>
    </>
  );
};

export default Menu;