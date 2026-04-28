import React from 'react';
import { useCategories } from '../hooks/useCategories';

interface SubNavProps {
  selectedCategory: string;
  onCategoryClick: (categoryId: string) => void;
}

const SubNav: React.FC<SubNavProps> = ({ selectedCategory, onCategoryClick }) => {
  const { categories, loading } = useCategories();

  return (
    <div className="sticky top-16 z-40 bg-quali-dark/80 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 overflow-x-auto py-3 scrollbar-hide">
          {loading ? (
            <div className="flex space-x-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-8 w-20 bg-white/5 rounded-full animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <button
                onClick={() => onCategoryClick('all')}
                className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest transition-all duration-300 border-2 ${
                  selectedCategory === 'all'
                    ? 'bg-quali-primary text-black border-quali-primary shadow-sm scale-105'
                    : 'bg-white/5 text-white border-white/5 hover:border-quali-primary/50 hover:text-quali-primary'
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onCategoryClick(c.id)}
                  className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 border-2 flex items-center space-x-2 whitespace-nowrap ${
                    selectedCategory === c.id
                      ? 'bg-quali-primary text-black border-quali-primary shadow-sm scale-105'
                      : 'bg-white/5 text-white border-white/5 hover:border-quali-primary/50 hover:text-quali-primary'
                  }`}
                >
                  <span className="font-noto-kr">{c.name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubNav;


