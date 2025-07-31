// import React, { useEffect, useState } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import api from '@/lib/api';

// function SeoAudits() {
//   const [audits, setAudits] = useState([]);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchAudits = async () => {
//       try {
//         const response = await api.getAuditData('');
//         setAudits(response.data);
//       } catch (err) {
//         console.error(err);
//         setError('Failed to load audits');
//       }
//     };

//     fetchAudits();
//   }, []);

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return (
//     <div className="space-y-4">
//       {audits.map((audit) => (
//         <Card key={audit.id} className="bg-white shadow">
//           <CardHeader>
//             <CardTitle>{audit.page.url}</CardTitle>
//           </CardHeader>
//           <CardContent>
//         <dl>
//           <dt>Title Tag:</dt> <dd>{audit.titleTag || 'N/A'}{' '}
//           <Badge aria-label={audit.titleExists ? 'Exists' : 'Missing'}>{audit.titleExists ? 'Exists' : 'Missing'}</Badge>
//         </dd></dl>
//         <dl>
//           <dt>Meta Description:</dt> <dd>{audit.metaDescription || 'N/A'}{' '}
//           <Badge aria-label={audit.metaDescriptionExists ? 'Exists' : 'Missing'}>{audit.metaDescriptionExists ? 'Exists' : 'Missing'}</Badge>
//         </dd></dl>
//         <dl>
//           <dt>Total Images:</dt> <dd>{audit.totalImages}{' '}
//           <Badge aria-label={audit.imagesOptimized ? 'Optimized' : 'Not Optimized'}>{audit.imagesOptimized ? 'Optimized' : 'Not Optimized'}</Badge>
//         </dd></dl>
//         <dl>
//           <dt>Internal Links:</dt> <dd>{audit.internalLinksCount}{' '}
//           <Badge aria-label={audit.brokenLinksCount === 0 ? 'All Working' : 'Broken'}>{audit.brokenLinksCount === 0 ? 'All Working' : 'Broken'}</Badge>
//         </dd></dl>
//             <div>
//               <strong>SEO Score:</strong> {audit.seoScore || 'N/A'}
//             </div>
//             <div>
//               <strong>Performance Score:</strong> {audit.performanceScore || 'N/A'}
//             </div>
//             <div>
//               <strong>Accessibility Score:</strong> {audit.accessibilityScore || 'N/A'}
//             </div>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// }

// export default SeoAudits;
