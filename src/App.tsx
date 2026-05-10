import { lazy, Suspense, useEffect, useLayoutEffect } from 'react';
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
const ReturnsPolicy = lazy(() => import('./pages/ReturnsPolicy'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));

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

function NavigationResetManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.history.scrollRestoration = 'manual';
  }, []);

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;
    const prevRootBehavior = root.style.scrollBehavior;
    const prevBodyBehavior = body.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    body.style.scrollBehavior = 'auto';

    const resetTop = () => {
      window.scrollTo(0, 0);
      root.scrollTop = 0;
      body.scrollTop = 0;
    };

    resetTop();
    const raf = window.requestAnimationFrame(resetTop);
    const timeout = window.setTimeout(resetTop, 75);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
      root.style.scrollBehavior = prevRootBehavior;
      body.style.scrollBehavior = prevBodyBehavior;
    };
  }, [pathname]);

  return null;
}

function RouteDocumentMeta() {
  const { pathname } = useLocation();
  const { lang } = useLanguage();

  useEffect(() => {
    const routeMeta: Record<string, { ar: { title: string; description: string }; fr: { title: string; description: string } }> = {
      '/': {
        ar: { title: 'Cuir - متجر الحقائب الجلدية الفاخرة', description: 'حقائب جلدية يدوية فاخرة من المغرب' },
        fr: { title: 'Cuir - Maroquinerie de luxe', description: 'Sacs en cuir artisanaux du Maroc' },
      },
      '/shop': {
        ar: { title: 'المتجر — Cuir', description: 'تسوق تشكيلة Cuir الكاملة من الحقائب والإكسسوارات الجلدية.' },
        fr: { title: 'Boutique — Cuir', description: 'Explorez la collection complète de sacs et accessoires Cuir.' },
      },
      '/about': {
        ar: { title: 'من نحن — Cuir', description: 'تعرف على قصة Cuir وحرفية الجلد المغربي الأصيل.' },
        fr: { title: 'À propos — Cuir', description: 'Découvrez l’histoire de Cuir et son artisanat marocain.' },
      },
      '/contact': {
        ar: { title: 'اتصل بنا — Cuir', description: 'تواصل مع فريق Cuir لخدمة العملاء والطلبات.' },
        fr: { title: 'Contact — Cuir', description: 'Contactez l’équipe Cuir pour toute demande ou assistance.' },
      },
      '/faq': {
        ar: { title: 'الأسئلة الشائعة — Cuir', description: 'إجابات على الأسئلة الشائعة حول الطلبات، الشحن، والإرجاع.' },
        fr: { title: 'FAQ — Cuir', description: 'Réponses aux questions fréquentes sur commandes, livraison et retours.' },
      },
      '/cart': {
        ar: { title: 'السلة — Cuir', description: 'راجع المنتجات التي أضفتها إلى سلة التسوق.' },
        fr: { title: 'Panier — Cuir', description: 'Vérifiez les articles ajoutés à votre panier.' },
      },
      '/checkout': {
        ar: { title: 'الدفع — Cuir', description: 'أكمل طلبك بأمان عبر صفحة الدفع الخاصة بـ Cuir.' },
        fr: { title: 'Paiement — Cuir', description: 'Finalisez votre commande en toute sécurité.' },
      },
      '/order-status': {
        ar: { title: 'حالة الطلب — Cuir', description: 'تابع حالة طلبك في Cuir.' },
        fr: { title: 'Suivi de commande — Cuir', description: 'Consultez le statut de votre commande Cuir.' },
      },
    };

    const route = routeMeta[pathname];
    if (route) {
      const selected = lang === 'ar' ? route.ar : route.fr;
      document.title = selected.title;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', selected.description);
    }

    const canonicalHref = `${window.location.origin}${pathname}`;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalHref);
  }, [pathname, lang]);

  return null;
}

function CustomerLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main key={location.pathname} className="flex-1">{children}</main>
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

  useEffect(() => {
    warmCommonRoutes();
  }, []);

  return (
    <div dir={dir} className="min-h-screen bg-beige-50">
      <NavigationResetManager />
      <RouteDocumentMeta />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Customer routes */}
          <Route
            path="/"
            element={
              <CustomerLayout>
                <Home />
              </CustomerLayout>
            }
          />
          <Route
            path="/shop"
            element={
              <CustomerLayout>
                <Shop />
              </CustomerLayout>
            }
          />
          <Route
            path="/product/:id"
            element={
              <CustomerLayout>
                <Product />
              </CustomerLayout>
            }
          />
          <Route
            path="/cart"
            element={
              <CustomerLayout>
                <Cart />
              </CustomerLayout>
            }
          />
          <Route
            path="/checkout"
            element={
              <CustomerLayout>
                <Checkout />
              </CustomerLayout>
            }
          />
          <Route
            path="/order-status"
            element={
              <CustomerLayout>
                <OrderStatus />
              </CustomerLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <CustomerLayout>
                <Contact />
              </CustomerLayout>
            }
          />
          <Route
            path="/about"
            element={
              <CustomerLayout>
                <About />
              </CustomerLayout>
            }
          />
          <Route
            path="/faq"
            element={
              <CustomerLayout>
                <FAQ />
              </CustomerLayout>
            }
          />
          <Route
            path="/returns"
            element={
              <CustomerLayout>
                <ReturnsPolicy />
              </CustomerLayout>
            }
          />
          <Route
            path="/politique-de-retour"
            element={<Navigate to="/returns" replace />}
          />
          <Route
            path="/privacy"
            element={
              <CustomerLayout>
                <PrivacyPolicy />
              </CustomerLayout>
            }
          />
          <Route
            path="/confidentialite"
            element={<Navigate to="/privacy" replace />}
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
