'use client';

import React, { useState } from 'react';
import SubFeatureLayout from '../SubFeatureLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import ChartComponent from '@/components/ChartComponent';
import { 
  mockData,
  type TechnicalIssue,
  type RankingDistribution
} from '@/libs/mockData';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

interface QuickFixItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: 'critical' | 'important' | 'recommended';
}

const OnPage = () => {
  const { technicalIssues, rankingDistribution } = mockData;
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [quickFixes, setQuickFixes] = useState<QuickFixItem[]>([
    {
      id: 'qf-1',
      title: 'Fix Missing Meta Descriptions',
      description: 'Add meta descriptions to 12 pages that are missing them',
      completed: false,
      category: 'important'
    },
    {
      id: 'qf-2',
      title: 'Optimize Page Load Speed',
      description: 'Compress images and minify CSS/JS files',
      completed: true,
      category: 'critical'
    },
    {
      id: 'qf-3',
      title: 'Add Alt Text to Images',
      description: 'Add descriptive alt text to 8 images',
      completed: false,
      category: 'recommended'
    },
    {
      id: 'qf-4',
      title: 'Fix Broken Internal Links',
      description: 'Update or remove 5 broken internal links',
      completed: false,
      category: 'critical'
    },
    {
      id: 'qf-5',
      title: 'Implement Schema Markup',
      description: 'Add structured data to product and article pages',
      completed: false,
      category: 'recommended'
    },
  ]);

  // Count issues by type and status
  const errorCount = technicalIssues.filter(issue => issue.type === 'error' && issue.status === 'open').length;
  const warningCount = technicalIssues.filter(issue => issue.type === 'warning' && issue.status === 'open').length;
  const noticeCount = technicalIssues.filter(issue => issue.type === 'notice' && issue.status === 'open').length;

  // Group issues by priority
  const groupedIssues = {
    high: technicalIssues.filter(issue => issue.priority === 'high'),
    medium: technicalIssues.filter(issue => issue.priority === 'medium'),
    low: technicalIssues.filter(issue => issue.priority === 'low'),
  };

  const toggleGroup = (priority: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(priority)) {
      newExpanded.delete(priority);
    } else {
      newExpanded.add(priority);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleQuickFix = (id: string) => {
    setQuickFixes(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'fixed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'ignored':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'notice':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  // Prepare chart data for ranking distribution
  const chartData = {
    labels: rankingDistribution.map(item => `Position ${item.position}`),
    datasets: [
      {
        label: 'Keywords',
        data: rankingDistribution.map(item => item.count),
        backgroundColor: [
          '#ef4444', // red for 1-3
          '#f97316', // orange for 4-10
          '#eab308', // yellow for 11-20
          '#22c55e', // green for 21-50
          '#3b82f6', // blue for 51-100
        ],
        borderWidth: 2,
      },
    ],
  };

  const barChartData = {
    labels: rankingDistribution.map(item => `Pos ${item.position}`),
    datasets: [
      {
        label: 'Keywords Count',
        data: rankingDistribution.map(item => item.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <SubFeatureLayout 
      title="On-Page SEO" 
      description="Technical & meta optimization insights with actionable recommendations."
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <p className="text-xs text-muted-foreground">
              Critical issues requiring immediate attention
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Warnings</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <p className="text-xs text-muted-foreground">
              Issues that should be addressed soon
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Notices</CardTitle>
            <Info className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{noticeCount}</div>
            <p className="text-xs text-muted-foreground">
              Minor improvements and optimizations
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Technical Issues List - Grouped by Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Issues by Priority</CardTitle>
            <p className="text-sm text-muted-foreground">
              Issues grouped by priority level with expandable details
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(groupedIssues).map(([priority, issues]) => {
              const isExpanded = expandedGroups.has(priority);
              const priorityLabel = priority.charAt(0).toUpperCase() + priority.slice(1);
              
              return (
                <div key={priority} className={`border rounded-lg p-4 ${getPriorityColor(priority)}`}>
                  <button
                    onClick={() => toggleGroup(priority)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center space-x-3">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <span className="font-semibold">{priorityLabel} Priority</span>
                      <Badge variant="outline">{issues.length}</Badge>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-4 space-y-3">
                      {issues.map((issue) => (
                        <div key={issue.id} className="bg-white dark:bg-gray-800 rounded p-3 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(issue.type)}
                              <span className="font-medium">{issue.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(issue.status)}
                              <Badge 
                                variant={issue.status === 'open' ? 'destructive' : 
                                        issue.status === 'fixed' ? 'default' : 'secondary'}
                              >
                                {issue.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <ExternalLink className="w-3 h-3" />
                              <span>{issue.url}</span>
                            </div>
                            <span>Found: {issue.dateFound}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Ranking Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Keyword Ranking Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              Distribution of keywords across different position ranges
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <ChartComponent
                type="pie"
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context: any) {
                          const item = rankingDistribution[context.dataIndex];
                          return `${context.label}: ${item.count} keywords (${item.percentage}%)`;
                        }
                      }
                    }
                  }
                }}
                className="h-64"
              />
            </div>
            
            {/* Bar Chart Alternative */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Bar Chart View</h4>
              <ChartComponent
                type="bar"
                data={barChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Number of Keywords'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Position Range'
                      }
                    }
                  }
                }}
                className="h-48"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick-Fix Checklist Component */}
      <Card>
        <CardHeader>
          <CardTitle>Quick-Fix Checklist</CardTitle>
          <p className="text-sm text-muted-foreground">
            Prioritized action items to improve your on-page SEO performance
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quickFixes.map((item) => {
              const categoryColors = {
                critical: 'border-l-red-500 bg-red-50 dark:bg-red-900/10',
                important: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
                recommended: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10',
              };
              
              return (
                <div 
                  key={item.id} 
                  className={`border-l-4 p-4 rounded-r-lg ${categoryColors[item.category]} ${
                    item.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={() => toggleQuickFix(item.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-medium ${
                          item.completed ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {item.title}
                        </h4>
                        <Badge 
                          variant={item.category === 'critical' ? 'destructive' : 
                                  item.category === 'important' ? 'default' : 'secondary'}
                        >
                          {item.category}
                        </Badge>
                      </div>
                      <p className={`text-sm ${
                        item.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'
                      }`}>
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <Button 
                          variant={item.completed ? "secondary" : "default"}
                          size="sm"
                          disabled={item.completed}
                          onClick={() => {
                            // Placeholder for actual functionality
                            console.log(`Action for ${item.title}`);
                          }}
                        >
                          {item.completed ? 'Completed' : 'Mark as Resolved'}
                        </Button>
                        {item.completed && (
                          <div className="flex items-center space-x-1 text-sm text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Resolved</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Progress Summary</h4>
                <p className="text-sm text-muted-foreground">
                  {quickFixes.filter(item => item.completed).length} of {quickFixes.length} tasks completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((quickFixes.filter(item => item.completed).length / quickFixes.length) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </SubFeatureLayout>
  );
};

export default OnPage;
