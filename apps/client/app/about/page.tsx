'use client';

import Image from 'next/image';
import Navbar from './navbar';

export default function AboutPage() {
  return (
    <main className="p-4 md:px-20 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <section className="text-center mt-5 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Empowering your online presence with data-driven SEO tools.
          </p>
        </section>

        <section className="space-y-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Image
              src="/seo-illustration.svg"
              alt="SEO Illustration"
              width={400}
              height={400}
              className="rounded-lg shadow-md w-full md:w-[45%]"
            />
            <div className="md:w-[55%]">
              <h2 className="text-2xl font-semibold mb-3">Who We Are</h2>
              <p className="text-gray-700 dark:text-gray-300">
                We are a team of developers, designers, and marketers passionate about helping businesses grow
                online. Our platform provides comprehensive SEO analysis tools to optimize your website and
                improve search engine visibility.
              </p>
            </div>
          </div>

          {/* What we offer */}
          <div className="flex flex-col-reverse md:flex-row items-center gap-8">
            <div className="md:w-[55%]">
              <h2 className="text-2xl font-semibold mb-3">What We Offer</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Real-time website audits</li>
                <li>SEO performance scoring and recommendations</li>
                <li>Backlink and keyword tracking</li>
                <li>Competitor benchmarking</li>
                <li>Custom reports and export features</li>
              </ul>
            </div>
            <Image
              src="/features-illustration.svg"
              alt="Features Illustration"
              width={400}
              height={400}
              className="rounded-lg shadow-md w-full md:w-[45%]"
            />
          </div>

          {/* Our Mission */}
          <div className="text-center pt-10 border-t dark:border-gray-800">
            <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300 max-w-xl mx-auto">
              We aim to make SEO accessible to everyone. Whether you’re a startup, freelancer, or enterprise,
              our goal is to give you the insights you need to grow and thrive online.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
