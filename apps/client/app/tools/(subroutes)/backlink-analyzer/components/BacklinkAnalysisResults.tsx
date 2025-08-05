'use client';

import React from 'react';

interface BacklinkAnalysisResultsProps {
  results: { url: string; quality: string; date: string; }[];
}

const BacklinkAnalysisResults: React.FC<BacklinkAnalysisResultsProps> = ({ results }) => {
  if (results.length === 0) {
    return <div>No backlink data available.</div>;
  }

  return (
    <table className="w-full mt-4 border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-gray-300 px-4 py-2">URL</th>
          <th className="border border-gray-300 px-4 py-2">Quality</th>
          <th className="border border-gray-300 px-4 py-2">Date Found</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result, index) => (
          <tr key={index} className="odd:bg-white even:bg-gray-100">
            <td className="border border-gray-300 px-4 py-2">{result.url}</td>
            <td className="border border-gray-300 px-4 py-2">{result.quality}</td>
            <td className="border border-gray-300 px-4 py-2">{result.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default BacklinkAnalysisResults;

