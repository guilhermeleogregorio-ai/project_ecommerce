import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

// Store Pages
import StoreHome from './pages/store/home';
import StoreCatalog from './pages/store/catalog';
import StoreProductDetail from './pages/store/product';
import StoreCart from './pages/store/cart';

// Checkout Pages
import CheckoutAccount from './pages/checkout/account';
import CheckoutPayment from './pages/checkout/payment';

// Operação da Loja Física e Balcão
import BalcaoOperacao from './pages/commercial/orders';
import AssistenteIA from './pages/commercial/customers';

// Admin Pages
import AdminDashboard from './pages/admin/dashboard';
import AdminProducts from './pages/admin/products';
import AdminSettings from './pages/admin/settings';

export default function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  const isPainelLojista = 
    location.pathname.startsWith('/admin') || 
    location.pathname.startsWith('/commercial') ||
    location.pathname.startsWith('/balcao');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      {/* Slide-over Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Main Content Area */}
      {isPainelLojista ? (
        <div className="flex-1 flex">
          <Sidebar />
          <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full">
            <Routes>
              {/* Painel do Balcão e Retirada */}
              <Route path="/commercial/orders" element={<BalcaoOperacao />} />
              <Route path="/balcao" element={<Navigate to="/commercial/orders" replace />} />
              
              {/* Assistente de IA / Orquestrador */}
              <Route path="/commercial/customers" element={<AssistenteIA />} />
              <Route path="/agentes" element={<Navigate to="/commercial/customers" replace />} />

              {/* Redirecionamento de rotas legadas para telas do desafio */}
              <Route path="/commercial/sellers" element={<Navigate to="/commercial/orders" replace />} />

              {/* Gestão e Catálogo */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Routes>
          </main>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full flex-1">
            <Routes>
              <Route path="/" element={<StoreHome />} />
              <Route path="/store" element={<Navigate to="/" replace />} />
              <Route path="/store/home" element={<StoreHome />} />
              <Route path="/store/catalog" element={<StoreCatalog />} />
              <Route path="/store/product/:id" element={<StoreProductDetail />} />
              <Route path="/store/cart" element={<StoreCart />} />

              {/* Checkout Simples com Retirada */}
              <Route path="/checkout/account" element={<CheckoutAccount />} />
              <Route path="/checkout/marketing" element={<Navigate to="/checkout/payment" replace />} />
              <Route path="/checkout/payment" element={<CheckoutPayment />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      )}
    </div>
  );
}
