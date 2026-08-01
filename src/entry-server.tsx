import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { AppRoutes } from './App';
import { ContentProvider } from './lib/content';
import { SeoProvider } from './lib/seo';
import { ConsultationProvider } from './components/ConsultationModal';
import { HelmetProvider, collectHeadEntries, renderHeadToString } from './lib/helmet';
import { setSSGData, type SSGData } from './lib/ssgData';

export function render(url: string, ssgData: SSGData) {
  setSSGData(ssgData);

  const html = renderToString(
    <HelmetProvider>
      <ContentProvider>
        <SeoProvider>
          <StaticRouter location={url}>
            <ConsultationProvider>
              <AppRoutes />
            </ConsultationProvider>
          </StaticRouter>
        </SeoProvider>
      </ContentProvider>
    </HelmetProvider>
  );

  const headEntries = collectHeadEntries();
  const head = renderHeadToString(headEntries);

  return { html, head };
}
