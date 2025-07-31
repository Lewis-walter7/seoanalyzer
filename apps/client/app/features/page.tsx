'use client';

import { useState } from 'react';
import Sidebar from '../components/sidebar/sidebar'; 
import Navbar from '../about/navbar';
import { LayoutDashboard, BrainCircuit, FileSearch, SearchCode, SearchCheck, BarChart3, TrendingUp, Target, Users, Zap } from 'lucide-react';

export default function FeaturesPage() {
  const [open, setOpen] = useState(false);

  const features = [
    {
      icon: LayoutDashboard,
      title: "SEO Analytics",
      description: "Comprehensive analytics dashboard with real-time insights into your website's SEO performance, keyword rankings, and traffic patterns.",
      href: "/features/analytics",
      highlights: ["Real-time tracking", "Custom reports", "Performance metrics", "Competitor analysis"]
    },
    {
      icon: BrainCircuit,
      title: "AI Optimization",
      description: "Leverage artificial intelligence to automatically optimize your content, identify opportunities, and improve your search engine rankings.",
      href: "/features/ai",
      highlights: ["Content optimization", "Keyword suggestions", "Auto-generated meta tags", "Smart recommendations"]
    },
    {
      icon: FileSearch,
      title: "Content SEO",
      description: "Analyze and optimize your content for better search engine visibility with advanced content scoring and recommendations.",
      href: "/features/content",
      highlights: ["Content scoring", "Readability analysis", "Keyword density", "Content gaps"]
    },
    {
      icon: SearchCode,
      title: "On-page SEO",
      description: "Comprehensive on-page optimization tools including meta tags, headers, internal linking, and technical SEO analysis.",
      href: "/features/onpage",
      highlights: ["Meta optimization", "Header analysis", "Internal linking", "Schema markup"]
    },
    {
      icon: SearchCheck,
      title: "Off-page SEO",
      description: "Monitor and improve your off-page SEO with backlink analysis, competitor research, and link building opportunities.",
      href: "/features/offpage",
      highlights: ["Backlink monitoring", "Link building", "Domain authority", "Competitor backlinks"]
    }
  ];

  const stats = [
    { icon: BarChart3, label: "Websites Analyzed", value: "50,000+" },
    { icon: TrendingUp, label: "Average Ranking Improvement", value: "127%" },
    { icon: Target, label: "Keywords Tracked", value: "2M+" },
    { icon: Users, label: "Active Users", value: "10,000+" }
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white">
      <Sidebar open={open} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Navbar/>
        <section className="dark:bg-gray-900 h-full overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Powerful SEO Features
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                Discover our comprehensive suite of SEO tools designed to boost your website&apos;s search engines visibility, 
                improve rankings, and drive organic traffic growth.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Powered by AI • Real-time Analytics • 24/7 Monitoring</span>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                    <IconComponent className="h-8 w-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1" aria-label={`Value: ${stat.value}`}>{stat.value}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300" aria-label={`Label: ${stat.label}`}>{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                        <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{feature.description}</p>
                    <div className="space-y-2 mb-6">
                      {feature.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                          {highlight}
                        </div>
                      ))}
                    </div>
                    <a 
                      href={feature.href}
                      className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                    >
                      Learn More →
                    </a>
                  </div>
                );
              })}
            </div>

            {/* CTA Section */}
            <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Boost Your SEO?</h2>
              <p className="text-xl mb-8 opacity-90">Join thousands of websites already improving their search rankings with our tools.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Start Free Trial
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all">
                  View Pricing
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
