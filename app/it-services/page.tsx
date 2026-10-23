import type { Metadata } from 'next';
import Link from 'next/link';

const PAGE_TITLE =
  'Mitchell Ekoh IT Services, Computer Help in Columbus and Atlanta | EnhanceRez';
const PAGE_DESCRIPTION =
  'Computer setup, repair, WiFi, and small business security help in Columbus and the Atlanta metro. Flat quotes first. Call or text (470) 834 2676.';
const PAGE_URL = 'https://enhancerez.com/it-services';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: 'EnhanceRez',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

const SERVICES = [
  {
    title: 'Computer setup and repair',
    body: 'New computers set up with accounts, email, printer, and your files moved over. Slow or misbehaving machines diagnosed and cleaned up, with honest advice when a machine is not worth saving.',
  },
  {
    title: 'WiFi and small office networks',
    body: 'Router setup, dead spot fixes, guest WiFi kept separate from your business network, and printers shared the right way.',
  },
  {
    title: 'Business email and accounts',
    body: 'Microsoft 365 and Google Workspace set up on your own domain, with team accounts, shared files, and staff changes handled cleanly.',
  },
  {
    title: 'Security checkup for small offices',
    body: 'A plain English review of updates, antivirus, sign in protection, admin accounts, and backups, with a written list of what was fixed and what to fix next.',
  },
  {
    title: 'Backups that actually work',
    body: 'Automatic backup for your important files, proven with a real test restore, so a dead laptop never takes your photos or records with it.',
  },
  {
    title: 'Printers and point of sale',
    body: 'Fast help for the register printer, card reader, receipt printer, and other gremlins that stop a shop cold.',
  },
];

const PRICING = [
  {
    amount: '$75 per hour',
    body: 'Standard rate for repair and support, with a one hour minimum for on site visits. You get a flat quote before work begins whenever the job allows.',
  },
  {
    amount: '$249 flat',
    body: 'Small business security checkup for one office with up to five computers, including a one page written summary.',
  },
  {
    amount: '$129 flat',
    body: 'New computer setup per machine, including accounts, email, printer, data transfer, updates, and backup turned on.',
  },
  {
    amount: '$59 per month',
    body: 'Care plan per user for small offices, with priority help, update checks, and backup monitoring. No contract. Three user minimum. Care plan members get on site visits at $60 per hour. Hardware is always at cost, with the receipt shown.',
  },
];

const STEPS = [
  'You call or text and tell me what is acting up.',
  'I give you a flat quote before work starts whenever I can.',
  'I do the work and explain, in plain English, what was wrong and what I did.',
  'If something is not worth fixing, I tell you that instead of billing you for it.',
];

const LOCAL_BUSINESS_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'ComputerRepair',
  name: 'Mitchell Ekoh IT Services',
  url: PAGE_URL,
  telephone: '+1-470-834-2676',
  email: 'ekoh.mitch@gmail.com',
  priceRange: '$$',
  description:
    'Computer setup, repair, WiFi, and small business security help in Columbus and the Atlanta metro. Flat quotes before work begins.',
  founder: {
    '@type': 'Person',
    name: 'Mitchell Ekoh',
    jobTitle: 'Owner',
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'degree',
      name: 'Bachelor of Science in Computer Science and Cybersecurity',
    },
  },
  areaServed: [
    'Columbus, GA',
    'Phenix City, AL',
    'Tucker, GA',
    'Decatur, GA',
    'Stone Mountain, GA',
    'Atlanta, GA',
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '14:00',
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'IT services pricing',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Hourly computer support' },
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: 75,
          priceCurrency: 'USD',
          unitText: 'HUR',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Small Business Security Checkup' },
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: 249,
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'New Computer Setup' },
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: 129,
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: 'Care Plan' },
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: 59,
          priceCurrency: 'USD',
          unitText: 'MON',
        },
      },
    ],
  },
  makesOffer: SERVICES.map((service) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name: service.title },
  })),
};

function CallButtons() {
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href="tel:+14708342676"
        className="inline-block bg-amber-400 text-slate-950 font-semibold text-sm px-5 py-3 rounded-lg hover:bg-amber-300 transition shadow"
      >
        Call or text (470) 834 2676
      </a>
      <a
        href="mailto:ekoh.mitch@gmail.com"
        className="inline-block bg-white text-slate-700 font-semibold text-sm px-5 py-3 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
      >
        Email ekoh.mitch@gmail.com
      </a>
    </div>
  );
}

export default function ItServicesPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF9] text-slate-800 font-sans antialiased px-4 py-6 sm:px-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_JSON_LD) }}
      />
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-slate-200 pb-4">
          <Link href="/" className="text-2xl font-bold font-serif text-slate-900">
            Enhancerez<span className="text-amber-600">.com</span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
          >
            ← Back to home
          </Link>
        </header>

        <section className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
            Mitchell Ekoh IT Services
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            Local computer help, done right the first time.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
            I am Mitchell Ekoh. I hold a Bachelor of Science in Computer Science and
            Cybersecurity. I help small businesses and home users in Columbus and the Atlanta
            metro with setup, repair, WiFi, and security. The person you call is the person
            who shows up and does the work.
          </p>
          <CallButtons />
          <p className="text-xs text-slate-500">
            Serving Columbus, Phenix City, Tucker, Decatur, Stone Mountain, and nearby areas.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            What I can fix for you
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2 shadow-sm"
              >
                <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Simple, flat pricing
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRICING.map((p) => (
              <div
                key={p.amount}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-2 shadow-sm"
              >
                <p className="text-2xl font-bold text-slate-900">{p.amount}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            How working with me goes
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl px-5 shadow-sm">
            <ul className="divide-y divide-slate-200">
              {STEPS.map((step, i) => (
                <li key={step} className="flex gap-3 py-3.5 text-sm text-slate-600 leading-relaxed">
                  <span className="text-amber-500 font-bold shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Proof of work
          </h2>
          <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
            I also build software. EnhanceRez is a live product I built and run, at
            enhancerez.com. It helps job seekers tailor resumes and cover letters. Ask me to
            show it to you on my phone when we meet.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="tel:+14708342676"
              className="inline-block bg-amber-400 text-slate-950 font-semibold text-sm px-5 py-3 rounded-lg hover:bg-amber-300 transition shadow"
            >
              Call or text (470) 834 2676
            </a>
            <a
              href="https://enhancerez.com"
              className="inline-block bg-white text-slate-700 font-semibold text-sm px-5 py-3 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
            >
              Visit enhancerez.com
            </a>
          </div>
        </section>

        <p className="text-xs text-slate-500 leading-relaxed">
          Mitchell Ekoh IT Services. Columbus and Atlanta metro, Georgia. Hours by
          appointment, Monday to Friday 8 AM to 6 PM, Saturday 9 AM to 2 PM.
        </p>
      </div>

      {/* Site Footer */}
      <footer className="max-w-5xl mx-auto mt-10 border-t border-slate-200 pt-5 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-slate-500">
          Enhancerez<span className="text-amber-600">.com</span>, AI Resume Builder
        </p>
        <nav className="flex items-center gap-4 text-[11px] text-slate-500">
          <Link href="/pricing" className="hover:text-amber-600 transition">Pricing</Link>
          <Link href="/blog" className="hover:text-amber-600 transition">Blog</Link>
          <Link href="/terms" className="hover:text-amber-600 transition">Terms</Link>
          <Link href="/privacy" className="hover:text-amber-600 transition">Privacy</Link>
          <Link href="/contact" className="hover:text-amber-600 transition">Contact</Link>
        </nav>
      </footer>
    </main>
  );
}
