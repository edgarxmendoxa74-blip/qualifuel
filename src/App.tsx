import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCart } from './hooks/useCart';
import Header from './components/Header';
import SubNav from './components/SubNav';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import FloatingCartButton from './components/FloatingCartButton';
import AdminDashboard from './components/AdminDashboard';
import { useMenu } from './hooks/useMenu';

function MainApp() {
  const cart = useCart();
  const { menuItems } = useMenu();
  const [currentView, setCurrentView] = React.useState<'menu' | 'cart' | 'checkout'>('menu');
  const [selectedCategory, setSelectedCategory] = React.useState('');

  // Auto-select first category if none is selected
  React.useEffect(() => {
    if (!selectedCategory && menuItems.length > 0) {
      const firstCategory = menuItems[0]?.category;
      if (firstCategory) setSelectedCategory(firstCategory);
    }
  }, [menuItems, selectedCategory]);

  const handleViewChange = (view: 'menu' | 'cart' | 'checkout') => {
    setCurrentView(view);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="min-h-screen bg-quali-dark font-pretendard">
      <Header 
        cartItemsCount={cart.getTotalItems()}
        onCartClick={() => handleViewChange('cart')}
        onMenuClick={() => handleViewChange('menu')}
      />
      
      {currentView === 'menu' && (
        <SubNav 
          selectedCategory={selectedCategory}
          onCategoryClick={handleCategoryClick}
        />
      )}
      
      {currentView === 'menu' && (
        <Menu 
          menuItems={menuItems}
          addToCart={cart.addToCart}
          cartItems={cart.cartItems}
          updateQuantity={cart.updateQuantity}
          selectedCategory={selectedCategory}
        />
      )}
      
      {currentView === 'cart' && (
        <Cart 
          cartItems={cart.cartItems}
          updateQuantity={cart.updateQuantity}
          removeFromCart={cart.removeFromCart}
          clearCart={cart.clearCart}
          getTotalPrice={cart.getTotalPrice}
          getSubtotal={cart.getSubtotal}
          onContinueShopping={() => handleViewChange('menu')}
          onCheckout={() => handleViewChange('checkout')}
          appliedVoucher={cart.appliedVoucher}
        />
      )}
      
      {currentView === 'checkout' && (
        <Checkout 
          cartItems={cart.cartItems}
          totalPrice={cart.getTotalPrice()}
          subtotalPrice={cart.getSubtotal()}
          onBack={() => handleViewChange('cart')}
          appliedVoucher={cart.appliedVoucher}
          onVoucherApplied={cart.applyVoucher}
          onVoucherRemoved={cart.removeVoucher}
        />
      )}
      
      {currentView === 'menu' && (
        <FloatingCartButton 
          itemCount={cart.getTotalItems()}
          onCartClick={() => handleViewChange('cart')}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;