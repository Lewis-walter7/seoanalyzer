'use client';

import React from 'react';

interface TrafficData {
  competitor: string;
  organicTraffic: number;
  paidTraffic: number;
  totalVisitors: number;
  bounceRate: number;
}

interface TrafficAnalysisChartProps {
  data: TrafficData[];
}

const TrafficAnalysisChart: React.FC<TrafficAnalysisChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Traffic Analysis</h3>
        <p className="text-gray-500 dark:text-gray-400">No traffic data available</p>
      </div>
    );
  }

  const maxTraffic = Math.max(...data.map(d => d.totalVisitors));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold mb-4">Traffic Analysis</h3>
      <div className="space-y-4">
        {data.map((competitor, index) => (
          <div key={index} className="border-b pb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">{competitor.competitor}</h4>
              <span className="text-sm text-gray-600">
                {competitor.totalVisitors.toLocaleString()} visitors
              </span>
            </div>
            
            {/* Traffic breakdown bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-blue-600 h-4 rounded-full flex"
                style={{ width: `${(competitor.totalVisitors / maxTraffic) * 100}%` }}
              >
                <div
                  className="bg-green-500 h-4 rounded-l-full"
                  style={{ 
                    width: `${(competitor.organicTraffic / competitor.totalVisitors) * 100}%` 
                  }}
                ></div>
                <div
                  className="bg-orange-500 h-4"
                  style={{ 
                    width: `${(competitor.paidTraffic / competitor.totalVisitors) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Organic: </span>
                <span className="font-medium">{competitor.organicTraffic.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Paid: </span>
                <span className="font-medium">{competitor.paidTraffic.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Bounce Rate: </span>
                <span className="font-medium">{competitor.bounceRate}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span>Organic Traffic</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
          <span>Paid Traffic</span>
        </div>
      </div>
    </div>
  );
};

export default TrafficAnalysisChart;
