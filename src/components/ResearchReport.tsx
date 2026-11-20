import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, FileText, Share2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Seo, SITE_URL, SITE_NAME } from './Seo';
import { NotFound } from './NotFound';
import { getResearchReport, formatResearchDate } from '../data/research';

export function ResearchReport() {
  const { slug } = useParams<{ slug: string }>();
  const report = slug ? getResearchReport(slug) : undefined;

  if (!report) {
    return <NotFound />;
  }

  const pageUrl = `${SITE_URL}/research/${report.slug}`;
  const pdfUrl = `${SITE_URL}${report.pdfPath}`;
  const fullTitle = `${report.kicker}: ${report.title}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Report',
    name: fullTitle,
    headline: fullTitle,
    alternativeHeadline: report.subtitle,
    description: report.summary,
    url: pageUrl,
    datePublished: report.publishedAt,
    identifier: report.reference,
    version: report.revision,
    inLanguage: 'en-GB',
    keywords: report.topics.join(', '),
    author: { '@type': 'Person', name: report.author.name, jobTitle: report.author.position },
    publisher: { '@type': 'Organization', name: SITE_NAME, '@id': `${SITE_URL}/#organization` },
    encoding: { '@type': 'MediaObject', contentUrl: pdfUrl, encodingFormat: 'application/pdf' },
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: fullTitle, text: report.subtitle, url: pageUrl });
      } else {
        await navigator.clipboard.writeText(pageUrl);
      }
    } catch {
      /* user cancelled share sheet */
    }
  };

  const DownloadButton = ({ variant = 'primary' }: { variant?: 'primary' | 'outline' }) => (
    <a
      href={report.pdfPath}
      target="_blank"
      rel="noopener"
      className={
        variant === 'primary'
          ? 'inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold-500 text-navy-950 rounded-md text-sm font-semibold hover:bg-gold-400 transition-colors'
          : 'inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/25 text-white rounded-md text-sm font-semibold hover:border-gold-400 hover:text-gold-400 transition-colors'
      }
    >
      <Download className="w-4 h-4" />
      Download full report (PDF, {report.pdfSizeKb} KB)
    </a>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-navy-950">
      <Seo title={fullTitle} description={report.summary} path={`/research/${report.slug}`} type="article" />
      <Helmet>
        <meta property="article:published_time" content={report.publishedAt} />
        <meta property="article:section" content="Research" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Navbar />

      {/* Cover / hero */}
      <header className="relative bg-navy-900 pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
        <div
          aria-hidden="true"
          className="hidden md:block absolute -right-40 top-24 w-[36rem] h-[36rem] rounded-full border border-gold-500/50"
        />
        <div
          aria-hidden="true"
          className="hidden md:block absolute right-0 top-48 w-1/3 h-full opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(94,184,184,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(94,184,184,0.6) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/research"
            className="inline-flex items-center gap-2 text-sm text-navy-200 hover:text-gold-400 transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            All research
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="w-12 h-1 bg-gold-500 mb-6" />
            <p className="text-xs uppercase tracking-[0.16em] text-navy-200 mb-8">{report.series}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400 mb-4">{report.kicker}</p>
            <h1 className="text-4xl md:text-6xl font-serif text-white leading-tight mb-6">{report.title}</h1>
            <p className="text-lg md:text-xl text-navy-100 mb-10">{report.subtitle}</p>
          </motion.div>

          <dl className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl border-t border-white/15 pt-6 mb-10">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white mb-1.5">Research by</dt>
              <dd className="text-sm text-navy-100">{report.author.name}</dd>
              <dd className="text-xs text-navy-300">{report.author.position}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white mb-1.5">Research date</dt>
              <dd className="text-sm text-navy-100">{formatResearchDate(report.publishedAt)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white mb-1.5">Classification</dt>
              <dd className="text-sm text-navy-100">{report.classification}</dd>
            </div>
          </dl>

          <div className="relative flex flex-col sm:flex-row gap-3">
            <DownloadButton />
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/25 text-white rounded-md text-sm font-semibold hover:border-gold-400 hover:text-gold-400 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
          <p className="relative mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-400">
            {report.reference} / Revision {report.revision}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main column */}
          <div className="lg:col-span-8 space-y-16">
            {/* Executive assessment */}
            <section>
              <SectionLabel>Executive assessment</SectionLabel>
              <p className="text-xl text-navy-700 dark:text-navy-100 leading-relaxed mb-8">
                The AI build-out is now spending more cash than it generates. We think a repricing is more likely
                than not, and that it has already begun.
              </p>
              <div className="rounded-lg bg-gold-50 dark:bg-gold-900/20 border-l-4 border-gold-500 p-6 mb-10">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-800 dark:text-gold-300 mb-2">
                  Core investment thesis
                </p>
                <p className="text-navy-800 dark:text-navy-100 leading-relaxed">{report.coreThesis}</p>
              </div>

              <h3 className="text-xl font-semibold text-navy-900 dark:text-white mb-4">Executive conclusions</h3>
              <ul className="space-y-4">
                {report.conclusions.map((c) => (
                  <li key={c.lead} className="flex gap-3">
                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-teal-600 flex-shrink-0" />
                    <p className="text-navy-600 dark:text-navy-200 leading-relaxed">
                      <strong className="text-navy-900 dark:text-white">{c.lead}</strong> {c.body}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Key figures */}
            <section>
              <SectionLabel>The AI cycle: where the cash stands</SectionLabel>
              <p className="text-navy-600 dark:text-navy-200 leading-relaxed mb-6">
                Between the second and third quarters, the four largest hyperscalers moved, in aggregate, from funding
                the build-out out of cash flow to funding it with borrowing.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {report.keyFigures.map((f) => (
                  <div key={f.label} className="rounded-lg bg-navy-50 dark:bg-navy-900 p-6">
                    <div className="w-8 h-0.5 bg-gold-500 mb-4" />
                    <p className="text-3xl font-bold text-navy-900 dark:text-white mb-2">{f.value}</p>
                    <p className="text-sm font-semibold text-navy-800 dark:text-navy-100 mb-1">{f.label}</p>
                    <p className="text-xs text-navy-500 dark:text-navy-300">{f.note}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Scenarios */}
            <section>
              <SectionLabel>Three paths, ranked</SectionLabel>
              <div className="space-y-4">
                {report.scenarios.map((s, i) => (
                  <div key={s.name} className="rounded-lg bg-navy-50 dark:bg-navy-900 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
                      <h3 className="font-semibold text-navy-900 dark:text-white">
                        {i + 1}. {s.name}
                      </h3>
                      <p className="text-sm font-semibold text-gold-600 dark:text-gold-400">
                        ~{s.share}% · {s.likelihood}
                      </p>
                    </div>
                    <div
                      className="h-2 rounded-full bg-navy-100 dark:bg-white/10 mb-4"
                      role="img"
                      aria-label={`Indicative likelihood about ${s.share} per cent`}
                    >
                      <div className="h-2 rounded-full bg-gold-500" style={{ width: `${s.share}%` }} />
                    </div>
                    <p className="text-sm text-navy-600 dark:text-navy-200 leading-relaxed">{s.summary}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-navy-400 dark:text-navy-300">{report.scenarioNote}</p>

              <div className="mt-8 rounded-lg bg-navy-900 dark:bg-navy-800 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-400 mb-2">Research call</p>
                <p className="text-white leading-relaxed">{report.researchCall}</p>
              </div>
            </section>

            {/* Opportunity map */}
            <section>
              <SectionLabel>The post-AI opportunity map</SectionLabel>
              <p className="text-navy-600 dark:text-navy-200 leading-relaxed mb-6">
                We rank six themes on end-market need, commercial readiness, dependence on AI budgets and the time
                required to monetise.
              </p>
              <div className="overflow-x-auto rounded-lg border border-navy-100 dark:border-white/10">
                <table className="w-full min-w-[40rem] text-sm text-left">
                  <thead className="bg-navy-900 text-white">
                    <tr>
                      {['Rank / sector', 'Window', 'Core investment case', 'Exposure to AI budgets', 'Key downside'].map(
                        (h) => (
                          <th key={h} scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider">
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100 dark:divide-white/10">
                    {report.themes.map((t) => (
                      <tr key={t.sector} className="odd:bg-navy-50/60 dark:odd:bg-navy-900/60 align-top">
                        <th scope="row" className="px-4 py-3 font-semibold text-navy-900 dark:text-white">
                          {t.rank} {t.sector}
                        </th>
                        <td className="px-4 py-3 text-navy-600 dark:text-navy-200 whitespace-nowrap">{t.window}</td>
                        <td className="px-4 py-3 text-navy-600 dark:text-navy-200">{t.investmentCase}</td>
                        <td className="px-4 py-3 text-navy-600 dark:text-navy-200">{t.aiExposure}</td>
                        <td className="px-4 py-3 text-navy-600 dark:text-navy-200">{t.downside}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-navy-400 dark:text-navy-300">
                Windows are the periods in which we expect each theme&apos;s economics to be tested, based on current
                deployment lead times and published forecasts. They are not return forecasts.
              </p>
            </section>

            {/* Defining thesis */}
            <section>
              <div className="rounded-lg bg-gold-50 dark:bg-gold-900/20 border-l-4 border-gold-500 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-800 dark:text-gold-300 mb-2">
                  Our defining thesis
                </p>
                <p className="text-lg font-serif text-navy-900 dark:text-white leading-relaxed">{report.definingThesis}</p>
              </div>
            </section>

            {/* Download CTA */}
            <section className="rounded-xl bg-navy-900 dark:bg-navy-800 p-8 md:p-10">
              <h2 className="text-2xl font-serif text-white mb-3">Read the full report</h2>
              <p className="text-navy-200 mb-6 max-w-2xl">
                The full {report.pages}-page report includes the case against our thesis, deep dives on energy,
                robotics, digital trust, advanced industry, biology and quantum, a three-phase transition to 2040, a
                nine-indicator monitoring dashboard with thresholds, and full source notes.
              </p>
              <DownloadButton />
            </section>

            {/* Important information */}
            <section className="border-t border-navy-100 dark:border-white/10 pt-8 space-y-4">
              {report.disclosure && (
                <p className="text-xs text-navy-500 dark:text-navy-300 leading-relaxed">
                  <strong className="text-navy-700 dark:text-navy-100">Disclosure.</strong> {report.disclosure}
                </p>
              )}
              <p className="text-xs text-navy-500 dark:text-navy-300 leading-relaxed">
                <strong className="text-navy-700 dark:text-navy-100">Important information.</strong>{' '}
                {report.importantInformation}
              </p>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 space-y-6">
              <div className="rounded-lg border border-navy-100 dark:border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-navy-900 dark:text-white">Full report</p>
                    <p className="text-xs text-navy-500 dark:text-navy-300">
                      PDF · {report.pages} pages · {report.pdfSizeKb} KB
                    </p>
                  </div>
                </div>
                <a
                  href={report.pdfPath}
                  target="_blank"
                  rel="noopener"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gold-500 text-navy-950 rounded-md text-sm font-semibold hover:bg-gold-400 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              </div>

              <div className="rounded-lg bg-navy-50 dark:bg-navy-900 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-500 dark:text-navy-300 mb-4">
                  In the full report
                </p>
                <ol className="space-y-2.5">
                  {report.contents.map((c, i) => (
                    <li key={c} className="flex gap-3 text-sm">
                      <span className="text-teal-700 dark:text-teal-400 font-semibold tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-navy-700 dark:text-navy-100">{c}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-lg bg-navy-50 dark:bg-navy-900 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-navy-500 dark:text-navy-300 mb-3">
                  Topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {report.topics.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-navy-800 text-navy-700 dark:text-navy-100 border border-navy-100 dark:border-white/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-navy-100 dark:border-white/10 p-6">
                <p className="text-sm font-semibold text-navy-900 dark:text-white mb-2">Discuss this research</p>
                <p className="text-sm text-navy-500 dark:text-navy-300 mb-4">
                  For questions about this report or how its themes affect your organisation, get in touch.
                </p>
                <a href="/#contact" className="text-sm font-semibold text-gold-600 dark:text-gold-400 hover:underline">
                  Contact us →
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-400 mb-2">
        MTP Research
      </p>
      <h2 className="text-2xl md:text-3xl font-semibold text-navy-900 dark:text-white">{children}</h2>
    </div>
  );
}
