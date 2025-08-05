'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  ArcElement,
  PointElement,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { cn } from '@/lib/utils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  ArcElement,
  PointElement
);

export interface ChartComponentProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut';
  data: ChartData<any>;
  options?: ChartOptions<any>;
  className?: string;
  title?: string;
}

// Get CSS custom property values for theming
const getCSSVariable = (variable: string): string => {
  if (typeof window === 'undefined') return '#3b82f6'; // fallback for SSR
  const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return value || '#3b82f6'; // fallback color
};

// Theme colors based on CSS variables from globals.css
const getThemeColors = () => ({
  chart1: getCSSVariable('--color-chart-1'),
  chart2: getCSSVariable('--color-chart-2'),
  chart3: getCSSVariable('--color-chart-3'),
  chart4: getCSSVariable('--color-chart-4'),
  chart5: getCSSVariable('--color-chart-5'),
  primary: getCSSVariable('--color-primary'),
  secondary: getCSSVariable('--color-secondary'),
  accent: getCSSVariable('--color-accent'),
  muted: getCSSVariable('--color-muted'),
});

export const ChartComponent: React.FC<ChartComponentProps> = ({
  type,
  data,
  options = {},
  className,
  title,
}) => {
  const themeColors = useMemo(() => getThemeColors(), []);

  // Default options with theme integration
  const defaultOptions: ChartOptions<any> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
            },
          },
        },
        title: {
          display: !!title,
          text: title,
          font: {
            size: 16,
            weight: 'bold',
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: themeColors.primary,
          borderWidth: 1,
        },
      },
      scales:
        type === 'pie' || type === 'doughnut'
          ? undefined
          : {
              x: {
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                  font: {
                    size: 11,
                  },
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                  font: {
                    size: 11,
                  },
                },
              },
            },
    }),
    [themeColors, title, type]
  );

  // Apply theme colors to datasets if not already specified
  const themedData = useMemo(() => {
    const colorPalette = [
      themeColors.chart1,
      themeColors.chart2,
      themeColors.chart3,
      themeColors.chart4,
      themeColors.chart5,
    ];

    return {
      ...data,
      datasets: data.datasets.map((dataset: any, index: number) => ({
        ...dataset,
        backgroundColor:
          dataset.backgroundColor ||
          (type === 'pie' || type === 'doughnut'
            ? colorPalette
            : `${colorPalette[index % colorPalette.length]}80`), // 50% opacity for bars/lines
        borderColor:
          dataset.borderColor || colorPalette[index % colorPalette.length],
        borderWidth: dataset.borderWidth || (type === 'line' ? 2 : 1),
        tension: dataset.tension || (type === 'line' ? 0.4 : undefined),
      })),
    };
  }, [data, themeColors, type]);

  // Merge default options with custom options
  const mergedOptions = useMemo(
    () => ({
      ...defaultOptions,
      ...options,
      plugins: {
        ...defaultOptions.plugins,
        ...options.plugins,
      },
      scales: {
        ...defaultOptions.scales,
        ...options.scales,
      },
    }),
    [defaultOptions, options]
  );

  const renderChart = () => {
    const props = {
      data: themedData,
      options: mergedOptions,
    };

    switch (type) {
      case 'bar':
        return <Bar {...props} />;
      case 'line':
        return <Line {...props} />;
      case 'pie':
        return <Pie {...props} />;
      case 'doughnut':
        return <Doughnut {...props} />;
      default:
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Unsupported chart type: {type}
          </div>
        );
    }
  };

  return (
    <div className={cn('relative w-full h-64', className)}>
      {renderChart()}
    </div>
  );
};

export default ChartComponent;

