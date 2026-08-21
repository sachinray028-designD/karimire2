import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import InquiryForm from '../components/InquiryForm';
import { useReveal } from '../lib/useReveal';
import { Seo } from '../lib/seo';

export default function Contact() {
  useReveal();
  return (
    <>
      <Seo page="contact" breadcrumbs={[{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact' }]} jsonLd={[
        {
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact Karimi Real Estate',
          url: 'https://www.karimi.ae/contact',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'RealEstateAgent',
          name: 'Karimi Real Estate LLC',
          url: 'https://www.karimi.ae',
          telephone: '+971528680423',
          email: 'info@karimi.ae',
          priceRange: '$$$$',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '8th Floor, Office 0810, Tamani Art Tower, Al Asayel Street, Business Bay',
            addressLocality: 'Dubai',
            addressCountry: 'AE',
          },
          geo: { '@type': 'GeoCoordinates', latitude: 25.1867, longitude: 55.2617 },
          openingHoursSpecification: [
            { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday','Monday','Tuesday','Wednesday','Thursday'], opens: '09:00', closes: '19:00' },
            { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Friday','Saturday'], opens: '10:00', closes: '16:00' },
          ],
          areaServed: { '@type': 'City', name: 'Dubai', addressCountry: 'AE' },
        },
      ]}/>
      <section className="pt-32 md:pt-44 pb-16 md:pb-20 bg-navy text-white">
        <div className="container-px max-w-4xl">
          <div className="eyebrow text-crimson-200"><span className="w-8 h-px bg-crimson"/>Private Consultation</div>
          <h1 className="mt-5 font-display text-5xl md:text-6xl">Let's talk Dubai.</h1>
          <p className="mt-5 text-white/70 text-lg max-w-2xl">30 minutes with a senior advisor. No obligation. A clear picture of how Dubai property can work for your capital.</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container-px grid lg:grid-cols-2 gap-14">
          <div className="reveal">
            <h2 className="font-display text-3xl text-navy mb-6">Send a brief</h2>
            <InquiryForm propertyName="General Enquiry"/>
          </div>
          <div className="reveal space-y-6">
            <div className="bg-navy-50/40 p-8">
              <h3 className="font-display text-2xl text-navy">Visit our office</h3>
              <div className="mt-5 space-y-4 text-navy/80">
                <div className="flex gap-3"><MapPin className="text-crimson shrink-0 mt-0.5" size={18}/><span>8th Floor, Office No. 0810,<br/>Tamani Art Tower, Al Asayel Street,<br/>Business Bay, Dubai</span></div>
                <div className="flex gap-3"><Phone className="text-crimson shrink-0 mt-0.5" size={18}/><span>+971 52 868 0423<br/>04 558 4435</span></div>
                <div className="flex gap-3"><Mail className="text-crimson shrink-0 mt-0.5" size={18}/><span>info@karimi.ae</span></div>
                <div className="flex gap-3"><Clock className="text-crimson shrink-0 mt-0.5" size={18}/><span>Sun – Thu, 9:00 – 19:00<br/>Fri – Sat, By appointment</span></div>
              </div>
            </div>
            <div className="aspect-[4/3] overflow-hidden">
              <iframe
                title="Karimi Real Estate, Business Bay"
                src="https://www.google.com/maps?q=Binary+Tower+Business+Bay+Dubai&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
