import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import { warmCommonRoutes } from './lib/routePreload';

// Customer pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const Product = lazy(() => import('./pages/Product'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderStatus = lazy(() => import('./pages/OrderStatus'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'));
const AdminReviews = lazy(() => import('./pages/admin/Reviews'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-beige-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-leather-200 border-t-leather-500 rounded-full animate-spin" />
        <p className="text-leather-600 font-arabic">جاري التحميل...</p>
      </div>
    </div>
  );
}

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.history.scrollRestoration = previousRestoration;
    };
  }, [pathname]);

  return null;
}

function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { dir } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    warmCommonRoutes();
  }, []);

  return (
    <div dir={dir} className="min-h-screen bg-beige-50">
      <ScrollToTopOnRouteChange />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Customer routes */}
          <Route
            path="/"
            element={
              <CustomerLayout key={location.pathname}>
                <Home />
              </CustomerLayout>
            }
          />
          <Route
            path="/shop"
            element={
              <CustomerLayout key={location.pathname}>
                <Shop />
              </CustomerLayout>
            }
          />
          <Route
            path="/product/:id"
            element={
              <CustomerLayout key={location.pathname}>
                <Product />
              </CustomerLayout>
            }
          />
          <Route
            path="/cart"
            element={
              <CustomerLayout key={location.pathname}>
                <Cart />
              </CustomerLayout>
            }
          />
          <Route
            path="/checkout"
            element={
              <CustomerLayout key={location.pathname}>
                <Checkout />
              </CustomerLayout>
            }
          />
          <Route
            path="/order-status"
            element={
              <CustomerLayout key={location.pathname}>
                <OrderStatus />
              </CustomerLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <CustomerLayout key={location.pathname}>
                <Contact />
              </CustomerLayout>
            }
          />
          <Route
            path="/about"
            element={
              <CustomerLayout key={location.pathname}>
                <About />
              </CustomerLayout>
            }
          />
          <Route
            path="/faq"
            element={
              <CustomerLayout key={location.pathname}>
                <FAQ />
              </CustomerLayout>
            }
          />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <ProtectedAdminRoute>
                <AdminProducts />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedAdminRoute>
                <AdminOrders />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <ProtectedAdminRoute>
                <AdminCustomers />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedAdminRoute>
                <AdminCategories />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <ProtectedAdminRoute>
                <AdminCoupons />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedAdminRoute>
                <AdminReviews />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedAdminRoute>
                <AdminSettings />
              </ProtectedAdminRoute>
            }
          />

          {/* Redirects */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
