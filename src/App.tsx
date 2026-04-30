import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Developers from './pages/Developers';
import { InsightsList, InsightDetail } from './pages/Insights';
import { Privacy, Terms, NotFound } from './pages/Legal';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminProperties from './pages/admin/AdminProperties';
import AdminLeads from './pages/admin/AdminLeads';
import AdminThemeEditor from './pages/admin/AdminThemeEditor';
import { ContentProvider } from './lib/content';
import { SeoProvider } from './lib/seo';
import { ConsultationProvider } from './components/ConsultationModal';

export default function App() {
  return (
    <ContentProvider>
    <SeoProvider>
    <BrowserRouter>
    <ConsultationProvider>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="leads" element={<AdminLeads />} />
          <Route path="theme" element={<AdminThemeEditor />} />
        </Route>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:slug" element={<PropertyDetail />} />
          <Route path="/developers" element={<Developers />} />
          <Route path="/insights" element={<InsightsList />} />
          <Route path="/insights/:slug" element={<InsightDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ConsultationProvider>
    </BrowserRouter>
    </SeoProvider>
    </ContentProvider>
  );
}
