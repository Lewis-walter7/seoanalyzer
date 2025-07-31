import { SeoAnalyzer } from '../utils/seo-analyzer.util';

// Sample HTML document for testing
const sampleHtml = `
  <html lang="en">
    <head>
      <title>Sample Page</title>
      <meta name="description" content="This is a sample page for SEO analysis.">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="canonical" href="https://example.com/sample-page">
      <meta property="og:title" content="Sample Page">
    </head>
    <body>
      <h1>Main Heading</h1>
      <h2>Subheading</h2>
      <img src="image1.jpg" alt="Image description">
      <img src="image2.jpg"> <!-- Missing alt -->
      <p>This is a sample paragraph with <a href="https://external.com">external link</a> 
      and <a href="/internal">internal link</a>.</p>
    </body>
  </html>
`;

// Create a new instance of the SeoAnalyzer
const seoAnalyzer = new SeoAnalyzer();

// Run analysis on the sample HTML
const seoAuditData = seoAnalyzer.analyzeHtml(sampleHtml, 'https://example.com/sample-page');

// Output the analysis results
console.log('SEO Audit Results:', seoAuditData);

