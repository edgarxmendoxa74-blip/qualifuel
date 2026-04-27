import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="bg-quali-gradient py-12 px-4 shadow-xl">
      <div className="max-w-7xl mx-auto text-center">
        {/* Features */}
        <div className="flex flex-wrap justify-center items-center gap-4 text-white font-bold text-sm md:text-lg mb-6">
          <span className="bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/30 shadow-lg">
            🥗 High Protein Meals
          </span>
          <span className="bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/30 shadow-lg">
            ⚡ Clean Energy
          </span>
          <span className="bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/30 shadow-lg">
            🏠 Freshly Prepared
          </span>
        </div>
        
        {/* Subtitle */}
        <p className="text-xl md:text-3xl text-white font-noto-kr font-extrabold tracking-wide drop-shadow-lg mb-2">
          Your Daily Partner in Health!
        </p>
        <p className="text-white/90 text-md md:text-lg font-medium opacity-90 max-w-2xl mx-auto">
          We make eating healthy easy, delicious, and hassle-free.
        </p>
      </div>
    </div>
  );
};

export default Hero;
