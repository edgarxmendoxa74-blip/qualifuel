import React, { useRef, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';

interface MobileNavProps {
  activeCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeCategory, onCategoryClick }) => {
  const { categories } = useCategories();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active category on mobile
  useEffect(() => {
    if (scrollRef.current && activeCategory) {
      const activeElement = scrollRef.current.querySelector(`[data-category="${activeCategory}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeCategory]);

  return (
    <div className="sticky top-[64px] z-40 bg-quali-dark/95 backdrop-blur-md border-b border-white/10 md:hidden">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide px-4 py-4 space-x-3"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            data-category={category.id}
            onClick={() => onCategoryClick(category.id)}
            className={`flex-shrink-0 flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all duration-300 border font-black uppercase text-[10px] tracking-widest ${
              activeCategory === category.id
                ? 'bg-quali-primary text-white border-quali-primary shadow-[0_0_20px_rgba(154,202,60,0.3)]'
                : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10'
            }`}
          >
            <span className="text-sm">{category.icon}</span>
            <span className="whitespace-nowrap italic">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;