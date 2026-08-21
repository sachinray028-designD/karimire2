import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Developers from './pages/Developers';
import { InsightsList, InsightDetail } from './pages/Insights';
import InsightsCluster from './pages/InsightsCluster';
import { Privacy, Terms, NotFound } from './pages/Legal';
import { ContentProvider } from './lib/content';
import { SeoProvider } from './lib/seo';
import { ConsultationProvider } from './components/ConsultationModal';
import { HelmetProvider } from './lib/helmet';

// Admin pages: lazy-loaded to keep them out of the public bundle.
// These are never prerendered, so React.lazy() is safe here.
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProperties = lazy(() => import('./pages/admin/AdminProperties'));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads'));
const AdminThemeEditor = lazy(() => import('./pages/admin/AdminThemeEditor'));

export function AppRoutes() {
  return (
    <Routes>
      {/* Admin routes — lazy-loaded, wrapped in Suspense */}
      <Route path="/admin/login" element={<Suspense fallback={null}><AdminLogin /></Suspense>} />
      <Route path="/admin" element={<Suspense fallback={null}><AdminLayout /></Suspense>}>
        <Route index element={<Suspense fallback={null}><Dashboard /></Suspense>} />
        <Route path="properties" element={<Suspense fallback={null}><AdminProperties /></Suspense>} />
        <Route path="leads" element={<Suspense fallback={null}><AdminLeads /></Suspense>} />
        <Route path="theme" element={<Suspense fallback={null}><AdminThemeEditor /></Suspense>} />
      </Route>
      {/* Public routes — static imports for SSG compatibility */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:slug" element={<PropertyDetail />} />
        <Route path="/developers" element={<Developers />} />
        <Route path="/insights" element={<InsightsList />} />
        <Route path="/insights/topic/:slug" element={<InsightsCluster />} />
        <Route path="/insights/:slug" element={<InsightDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ContentProvider>
        <SeoProvider>
          <BrowserRouter>
            <ConsultationProvider>
              <AppRoutes />
            </ConsultationProvider>
          </BrowserRouter>
        </SeoProvider>
      </ContentProvider>
    </HelmetProvider>
  );
}
