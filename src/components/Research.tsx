import { motion } from 'framer-motion';
import { ArrowRight, Download, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Seo } from './Seo';
import { researchReports, formatResearchDate } from '../data/research';

export function Research() {
  const reports = [...researchReports].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <div className="min-h-screen bg-white dark:bg-navy-950">
      <Seo
        title="Research"
        description="Independent thematic research from MustardTree Partners on technology, capital markets, governance and risk."
        path="/research"
      />
      <Navbar />

      <section className="relative bg-navy-900 pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="w-12 h-1 bg-gold-500 mb-6" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400 mb-5">
              MTP Research
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6">Research</h1>
            <p className="text-lg md:text-xl text-navy-200">
              Independent thematic research on technology, capital markets, governance and risk —
              written to make our views explicit and testable.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-400 dark:text-navy-300 mb-8">
            Latest reports
          </h2>
          <div className="space-y-8">
            {reports.map((report) => (
              <article
                key={report.slug}
                className="grid grid-cols-1 lg:grid-cols-12 rounded-xl overflow-hidden border border-navy-100 dark:border-white/10 bg-white dark:bg-navy-900 shadow-sm hover:shadow-lg transition-shadow"
              >
                {/* Cover panel */}
                <div className="lg:col-span-4 relative bg-navy-900 dark:bg-navy-800 p-8 min-h-[16rem] flex flex-col justify-between overflow-hidden">
                  <div
                    aria-hidden="true"
                    className="absolute -right-24 -bottom-24 w-72 h-72 rounded-full border border-gold-500/60"
                  />
                  <div className="relative">
                    <div className="w-10 h-1 bg-gold-500 mb-5" />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-400 mb-3">
                      {report.kicker}
                    </p>
                    <p className="text-3xl font-serif text-white leading-tight">{report.title}</p>
                  </div>
                  <p className="relative text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-400/80 mt-6">
                    {report.reference} / Revision {report.revision}
                  </p>
                </div>

                {/* Details */}
                <div className="lg:col-span-8 p-8 flex flex-col">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-600 dark:text-gold-400 mb-3">
                    {report.series}
                  </p>
                  <h3 className="text-2xl font-semibold text-navy-900 dark:text-white mb-2">
                    {report.kicker}: {report.title}
                  </h3>
                  <p className="text-navy-500 dark:text-navy-200 mb-4">{report.subtitle}</p>
                  <p className="text-navy-600 dark:text-navy-200/80 leading-relaxed mb-6">{report.summary}</p>

                  <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-8">
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-navy-400 dark:text-navy-300">Published</dt>
                      <dd className="text-navy-800 dark:text-white mt-1">{formatResearchDate(report.publishedAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-navy-400 dark:text-navy-300">Research by</dt>
                      <dd className="text-navy-800 dark:text-white mt-1">{report.author.name}</dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-navy-400 dark:text-navy-300">Format</dt>
                      <dd className="text-navy-800 dark:text-white mt-1 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-gold-500" />
                        PDF, {report.pages} pages
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-auto flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/research/${report.slug}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gold-500 text-navy-950 rounded-md text-sm font-semibold hover:bg-gold-400 transition-colors"
                    >
                      Read the summary
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href={report.pdfPath}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-navy-200 dark:border-white/20 text-navy-800 dark:text-white rounded-md text-sm font-semibold hover:border-gold-500 hover:text-gold-600 dark:hover:text-gold-400 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download full report
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-12 text-xs text-navy-400 dark:text-navy-300 max-w-3xl">
            MTP Research publications are general information for discussion and are not investment advice.
            Mustardtree Partners is not authorised to give regulated investment advice.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
