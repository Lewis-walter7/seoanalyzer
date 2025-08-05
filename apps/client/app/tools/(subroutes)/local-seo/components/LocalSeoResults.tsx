import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Chart.js components to prevent SSR issues
const Chart = dynamic(() => import('react-chartjs-2').then((mod) => mod.Chart), { ssr: false });
const Radar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Radar), { ssr: false });

interface LocalSeoResultsProps {
  results: any;
}

const LocalSeoResults: React.FC<LocalSeoResultsProps> = ({ results }) => {
  if (!results) {
    return <div>No Results</div>;
  }

  // Placeholder data for illustration purposes
  const radarData = {
    labels: ['Rating', 'Reviews Count', 'Consistency Score'],
    datasets: [
      {
        label: 'Your Business',
        data: [65, 59, 90],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
      },
      {
        label: 'Competitor',
        data: [28, 48, 40],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
      }
    ]
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">SEO Results</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map and table components to be added here */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Map View</h3>
          {/* Map display logic */}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Citations Consistency</h3>
          {/* Table display logic */}
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Radar Chart</h3>
          <Radar data={radarData} />
        </div>
      </div>
    </div>
  );
};

export default LocalSeoResults;

