import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  MapPin,
  Target,
  Shield,
  Truck,
  BarChart3,
  Building2,
  Heart,
  Leaf,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function GisServices() {
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [whatIsRef, whatIsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [servicesRef, servicesInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [sectorsRef, sectorsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [howWeWorkRef, howWeWorkInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [packagesRef, packagesInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [whyUsRef, whyUsInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const serviceOfferings = [
    {
      icon: Target,
      title: 'Location Intelligence & Market Strategy',
      subtitle: 'Understand where to grow, invest, and operate.',
      description: 'We help organisations analyse geographic demand, competition, and opportunity to guide expansion and location strategy.',
      services: [
        'Catchment area analysis',
        'Customer and demographic heatmaps',
        'Site selection and expansion modelling',
        'Competitor and market mapping',
        'Service coverage and gap analysis'
      ],
      useCases: [
        'Retail and service network planning',
        'Property and infrastructure development',
        'Market entry strategy',
        'Local authority service design'
      ]
    },
    {
      icon: Shield,
      title: 'Risk, Governance & Compliance Mapping',
      subtitle: 'Visualise risk exposure and regulatory impact across your footprint.',
      description: 'We provide spatial overlays that support governance, compliance, and ESG reporting.',
      services: [
        'Environmental and climate risk mapping',
        'Flood, fire, pollution, and hazard exposure analysis',
        'Regulatory boundary and planning constraint overlays',
        'Infrastructure proximity and vulnerability mapping',
        'ESG and sustainability risk visualisation'
      ],
      useCases: [
        'Property portfolio risk audits',
        'ESG disclosures',
        'Planning and regulatory assessments',
        'Infrastructure and asset resilience planning'
      ]
    },
    {
      icon: Truck,
      title: 'Operations & Resource Optimisation',
      subtitle: 'Deploy resources where they deliver the greatest impact.',
      description: 'We use GIS to optimise operations, logistics, and service delivery.',
      services: [
        'Facility placement optimisation',
        'Service accessibility and travel-time modelling',
        'Workforce deployment analysis',
        'Emergency response coverage modelling',
        'Route optimisation'
      ],
      useCases: [
        'Charity outreach and service delivery',
        'Healthcare accessibility planning',
        'Logistics and transport optimisation',
        'Emergency response readiness'
      ]
    },
    {
      icon: BarChart3,
      title: 'Data Integration & Geospatial Dashboards',
      subtitle: 'Bring all your data together into a single spatial view.',
      description: 'We integrate internal and external datasets into interactive dashboards and analytics platforms.',
      services: [
        'Multi-layer geospatial dashboards',
        'Real-time and near-real-time data feeds',
        'Integration with Power BI and cloud analytics',
        'API-enabled GIS platforms',
        'Custom reporting and insight visualisation'
      ],
      useCases: [
        'Executive dashboards',
        'Performance monitoring',
        'Operational intelligence',
        'Cross-departmental reporting'
      ]
    }
  ];

  const sectorSolutions = [
    {
      icon: Heart,
      title: 'Healthcare & Life Sciences',
      items: [
        'Disease hotspot analysis',
        'Service accessibility mapping',
        'Emergency planning and response',
        'Resource allocation modelling'
      ]
    },
    {
      icon: Building2,
      title: 'Property & Infrastructure',
      items: [
        'Development feasibility analysis',
        'Portfolio risk mapping',
        'Planning constraint overlays',
        'Transport access modelling'
      ]
    },
    {
      icon: MapPin,
      title: 'Public Sector & Local Government',
      items: [
        'Service coverage analysis',
        'Community need mapping',
        'Infrastructure planning',
        'Environmental impact modelling'
      ]
    },
    {
      icon: Leaf,
      title: 'ESG & Sustainability',
      items: [
        'Climate risk exposure mapping',
        'Environmental compliance overlays',
        'Sustainability reporting',
        'Social impact measurement'
      ]
    }
  ];

  const workflowSteps = [
    {
      step: 1,
      title: 'Discovery & Strategy Alignment',
      description: 'We identify your objectives, constraints, and decision needs.'
    },
    {
      step: 2,
      title: 'Data Integration',
      description: 'We connect your internal data with authoritative geographic datasets.'
    },
    {
      step: 3,
      title: 'Spatial Analysis & Modelling',
      description: 'We apply advanced geospatial techniques to uncover insight.'
    },
    {
      step: 4,
      title: 'Visualisation & Reporting',
      description: 'We deliver interactive dashboards, maps, and strategic reports.'
    },
    {
      step: 5,
      title: 'Advisory & Decision Support',
      description: 'We translate spatial insight into clear recommendations.'
    }
  ];

  const packages = [
    {
      name: 'Foundation',
      features: [
        'Static maps',
        'Single dataset integration',
        'Insight report'
      ]
    },
    {
      name: 'Strategy',
      features: [
        'Interactive dashboards',
        'Multi-layer datasets',
        'Recommendations and scenario modelling'
      ],
      highlighted: true
    },
    {
      name: 'Enterprise',
      features: [
        'Custom GIS platforms',
        'Live data feeds',
        'API integrations',
        'Governance and ESG reporting'
      ]
    }
  ];

  const whyUsPoints = [
    'Integrated with governance, business intelligence, and advisory services',
    'Sector-specific expertise',
    'Business-led, not technology-led',
    'Custom solutions aligned to your strategy',
    'Scalable from pilot projects to enterprise platforms'
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gray-900 py-32 pt-40">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={heroRef}
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6">
              Spatial Intelligence & <span className="text-yellow-500">GIS Services</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Turning Location Data into Strategic Advantage
            </p>
            <p className="text-lg text-gray-400 max-w-4xl mx-auto">
              At Mustardtree Partners, we help organisations make smarter decisions by unlocking the power of Spatial Intelligence and Geographic Information Systems (GIS).
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center"
          >
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              By combining geospatial analytics with our established strengths in business intelligence, governance, and advisory services, we deliver insight that goes beyond charts and spreadsheets — revealing the <strong>where</strong>, <strong>why</strong>, and <strong>what next</strong> behind your data.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Whether you are planning expansion, managing risk, optimising operations, or serving communities more effectively, our GIS services transform complex location data into clear, actionable intelligence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What Is Spatial Intelligence */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={whatIsRef}
            initial={{ opacity: 0, y: 30 }}
            animate={whatIsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-6">
              What Is <span className="text-yellow-600">Spatial Intelligence</span>?
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Spatial Intelligence is the practice of analysing data through a geographic lens to identify patterns, trends, risks, and opportunities that are invisible in traditional reporting.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={whatIsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-4xl mx-auto"
          >
            <p className="text-gray-700 dark:text-gray-300 mb-6 font-medium">It allows organisations to:</p>
            <ul className="space-y-4">
              {[
                'Understand how geography impacts performance',
                'Identify service gaps and underserved areas',
                'Optimise locations, resources, and infrastructure',
                'Visualise risk, compliance, and operational exposure',
                'Make evidence-based decisions grounded in real-world context'
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={whatIsInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </motion.li>
              ))}
            </ul>
            <p className="text-gray-700 mt-8 pt-6 border-t border-gray-100">
              At Mustardtree Partners, we integrate Spatial Intelligence directly into business strategy and governance frameworks.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service Offerings */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={servicesRef}
            initial={{ opacity: 0, y: 30 }}
            animate={servicesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-4">
              Our GIS <span className="text-yellow-600">Service Offerings</span>
            </h2>
          </motion.div>

          <div className="space-y-12">
            {serviceOfferings.map((offering, index) => {
              const Icon = offering.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.15 }}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 md:p-10"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                        <Icon className="h-8 w-8 text-yellow-600" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-yellow-600 font-semibold">{index + 1}.</span>
                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{offering.title}</h3>
                      </div>
                      <p className="text-lg text-yellow-600 font-medium mb-3">{offering.subtitle}</p>
                      <p className="text-gray-700 dark:text-gray-300 mb-6">{offering.description}</p>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Services include:</h4>
                          <ul className="space-y-2">
                            {offering.services.map((service, sIndex) => (
                              <li key={sIndex} className="flex items-start gap-2 text-gray-600">
                                <ArrowRight className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-1" />
                                <span>{service}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Typical use cases:</h4>
                          <ul className="space-y-2">
                            {offering.useCases.map((useCase, uIndex) => (
                              <li key={uIndex} className="flex items-start gap-2 text-gray-600">
                                <CheckCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-1" />
                                <span>{useCase}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sector Solutions */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={sectorsRef}
            initial={{ opacity: 0, y: 30 }}
            animate={sectorsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">
              Sector-Focused <span className="text-yellow-500">GIS Solutions</span>
            </h2>
            <p className="text-lg text-gray-400">
              We offer tailored Spatial Intelligence solutions for high-impact sectors
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sectorSolutions.map((sector, index) => {
              const Icon = sector.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={sectorsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors"
                >
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-4">{sector.title}</h3>
                  <ul className="space-y-2">
                    {sector.items.map((item, iIndex) => (
                      <li key={iIndex} className="text-gray-400 text-sm flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={howWeWorkRef}
            initial={{ opacity: 0, y: 30 }}
            animate={howWeWorkInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-4">
              How We <span className="text-yellow-600">Work</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We deliver GIS solutions through a structured, business-led approach
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={howWeWorkInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex gap-6 mb-8 last:mb-0"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-gray-900 font-bold text-lg">
                    {step.step}
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="w-0.5 h-12 bg-yellow-200 mx-auto mt-2"></div>
                  )}
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Commercial Packages */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={packagesRef}
            initial={{ opacity: 0, y: 30 }}
            animate={packagesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-4">
              Commercial <span className="text-yellow-600">Packages</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              We offer productised GIS services to suit organisations of all sizes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={packagesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`rounded-xl p-8 ${
                  pkg.highlighted
                    ? 'bg-yellow-500 text-gray-900 shadow-xl transform scale-105'
                    : 'bg-white dark:bg-gray-800 shadow-lg'
                }`}
              >
                <h3 className={`text-2xl font-semibold mb-6 ${pkg.highlighted ? 'text-gray-900' : 'text-gray-900'}`}>
                  {pkg.name}
                </h3>
                <ul className="space-y-3">
                  {pkg.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <CheckCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${pkg.highlighted ? 'text-gray-900' : 'text-yellow-500'}`} />
                      <span className={pkg.highlighted ? 'text-gray-900' : 'text-gray-700 dark:text-gray-300'}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={packagesInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center text-gray-600 dark:text-gray-400 mt-10"
          >
            Pricing available on request. All engagements are scoped to client requirements.
          </motion.p>
        </div>
      </section>

      {/* Why Mustardtree Partners */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={whyUsRef}
            initial={{ opacity: 0, y: 30 }}
            animate={whyUsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-4">
              Why <span className="text-yellow-600">Mustardtree Partners</span>?
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={whyUsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8"
          >
            <ul className="space-y-4">
              {whyUsPoints.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={whyUsInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300 text-lg">{point}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 dark:text-white mb-6">
              Ready to unlock the power of location data?
            </h2>
            <p className="text-lg text-gray-800 mb-8">
              Contact us to discuss how Spatial Intelligence can support your strategic objectives.
            </p>
            <a
              href="/#contact"
              className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Get in Touch
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
