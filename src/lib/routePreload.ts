const routeImporters = {
  '/': () => import('../pages/Home'),
  '/shop': () => import('../pages/Shop'),
  '/about': () => import('../pages/About'),
  '/contact': () => import('../pages/Contact'),
  '/faq': () => import('../pages/FAQ'),
  '/cart': () => import('../pages/Cart'),
  '/checkout': () => import('../pages/Checkout'),
  '/product': () => import('../pages/Product'),
  '/order-status': () => import('../pages/OrderStatus'),
  '/admin/login': () => import('../pages/admin/Login'),
  '/admin/dashboard': () => import('../pages/admin/Dashboard'),
} as const;

type RouteKey = keyof typeof routeImporters;
const preloaded = new Set<RouteKey>();

export function preloadRoute(route: RouteKey) {
  if (preloaded.has(route)) return;
  preloaded.add(route);
  void routeImporters[route]();
}

export function warmCommonRoutes() {
  const warm = () => {
    preloadRoute('/shop');
    preloadRoute('/about');
    preloadRoute('/cart');
  };

  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(warm, { timeout: 1200 });
    return;
  }

  globalThis.setTimeout(warm, 600);
}
