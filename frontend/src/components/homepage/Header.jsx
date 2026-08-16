import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

export const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();

  const handleLogout = () => {
    logout();
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'seller':
        return '/seller/dashboard';
      default:
        return '/user/dashboard';
    }
  };

  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    
    switch (user.role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'seller':
        return 'Seller Dashboard';
      default:
        return 'My Account';
    }
  };

  return (
    <div className="bg-black text-[#E8E0CC]">
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex justify-between items-center">
          <div className="text-xs tracking-widest uppercase">
            <span className="text-[#C9A84C] font-semibold">Welcome to VÆROX x AKARIOMART</span>
          </div>
          <div className="flex items-center space-x-6 text-xs tracking-wider uppercase">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="hover:text-[#C9A84C] transition-colors font-medium">
                  {getDashboardLabel()}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="hover:text-rose-400 transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-[#C9A84C] transition-colors font-medium">
                  Login
                </Link>
                <Link to="/register" className="hover:text-[#C9A84C] transition-colors font-medium">
                  Register
                </Link>
              </>
            )}
            <Link to="/contact" className="hover:text-[#C9A84C] transition-colors font-medium">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

