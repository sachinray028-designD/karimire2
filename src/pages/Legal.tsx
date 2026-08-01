import { Seo } from '../lib/seo';

export function Privacy() {
  return (
    <>
    <Seo page="privacy" breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Privacy', url: '/privacy' }]} />
    <section className="pt-32 md:pt-44 pb-16 md:pb-20 bg-white">
      <div className="container-px max-w-3xl">
        <h1 className="font-display text-5xl text-navy">Privacy Policy</h1>
        <div className="mt-8 space-y-5 text-navy/75 leading-relaxed">
          <p>Karimi Real Estate LLC ("we", "our", "us") respects the privacy of every visitor. This policy explains what we collect and how we use it.</p>
          <h2 className="font-display text-2xl text-navy mt-6">What we collect</h2>
          <p>When you submit an inquiry, we collect your name, email, phone, budget, purpose, and any message you share. Technical data (IP, device) may be logged for security.</p>
          <h2 className="font-display text-2xl text-navy mt-6">How we use it</h2>
          <p>To contact you about your inquiry, qualify property matches, and improve our service. We never sell your data.</p>
          <h2 className="font-display text-2xl text-navy mt-6">Your rights</h2>
          <p>You may request access, correction, or deletion of your data at any time by emailing info@karimi.ae.</p>
        </div>
      </div>
    </section>
    </>
  );
}

export function Terms() {
  return (
    <>
    <Seo page="terms" breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Terms', url: '/terms' }]} />
    <section className="pt-32 md:pt-44 pb-16 md:pb-20 bg-white">
      <div className="container-px max-w-3xl">
        <h1 className="font-display text-5xl text-navy">Terms & Conditions</h1>
        <div className="mt-8 space-y-5 text-navy/75 leading-relaxed">
          <p>These terms govern your use of karimi.ae. By accessing this site you agree to them.</p>
          <h2 className="font-display text-2xl text-navy mt-6">Property information</h2>
          <p>Prices, configurations, and handover dates are indicative and subject to change by the developer. Always confirm at point of booking.</p>
          <h2 className="font-display text-2xl text-navy mt-6">Advisory mandate</h2>
          <p>Karimi operates a zero-commission model. Our fee is paid by the developer of the acquired property. No advisory fee is charged to the buyer unless expressly agreed in writing.</p>
          <h2 className="font-display text-2xl text-navy mt-6">Jurisdiction</h2>
          <p>These terms are governed by the laws of the UAE and the Emirate of Dubai.</p>
        </div>
      </div>
    </section>
    </>
  );
}

export function NotFound() {
  return (
    <>
    <Seo page="notfound" noindex />
    <section className="pt-32 md:pt-40 pb-20 md:pb-28 bg-navy text-white min-h-[70vh] flex items-center">
      <div className="container-px text-center max-w-xl mx-auto">
        <div className="font-display text-9xl text-crimson">404</div>
        <h1 className="font-display text-4xl mt-4">Page not found.</h1>
        <p className="text-white/70 mt-4">The address you're looking for isn't part of our portfolio.</p>
        <a href="/" className="btn-primary mt-8 inline-flex">Return Home</a>
      </div>
    </section>
    </>
  );
}
