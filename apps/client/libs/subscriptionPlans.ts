interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  priceMonthly: number;
  priceYearly?: number;
  maxProjects: number;
  maxKeywords: number;
  maxAnalysesPerMonth: number;
  maxReportsPerMonth: number;
  maxCompetitors: number;
  hasAdvancedReports?: boolean;
  hasAPIAccess?: boolean;
  hasWhiteLabel?: boolean;
  hasCustomBranding?: boolean;
  hasPrioritySupport?: boolean;
  hasTeamCollaboration?: boolean;
  hasCustomAlerts?: boolean;
  hasDataExport?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
}

export const staticSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'free',
    displayName: 'Free',
    description: 'Perfect for getting started',
    priceMonthly: 0,
    priceYearly: 0,
    maxProjects: 1,
    maxKeywords: 10,
    maxAnalysesPerMonth: 5,
    maxReportsPerMonth: 2,
    maxCompetitors: 1,
    hasAdvancedReports: false,
    hasAPIAccess: false,
    hasWhiteLabel: false,
    hasCustomBranding: false,
    hasPrioritySupport: false,
    hasTeamCollaboration: false,
    hasCustomAlerts: false,
    hasDataExport: false,
    isPopular: false,
    sortOrder: 1,
  },
  {
    id: 'starter',
    name: 'starter',
    displayName: 'Starter',
    description: 'For small businesses and freelancers',
    priceMonthly: 1700, 
    priceYearly: 16300, 
    maxProjects: 5,
    maxKeywords: 100,
    maxAnalysesPerMonth: 50,
    maxReportsPerMonth: 10,
    maxCompetitors: 5,
    hasAdvancedReports: true,
    hasAPIAccess: false,
    hasWhiteLabel: false,
    hasCustomBranding: false,
    hasPrioritySupport: false,
    hasTeamCollaboration: false,
    hasCustomAlerts: true,
    hasDataExport: true,
    isPopular: true,
    sortOrder: 2,
  },
  {
    id: 'professional',
    name: 'professional',
    displayName: 'Professional',
    description: 'For growing agencies and teams',
    priceMonthly: 5900, 
    priceYearly: 56600, // $758.40 in ce
    maxProjects: 25,
    maxKeywords: 500,
    maxAnalysesPerMonth: 200,
    maxReportsPerMonth: 50,
    maxCompetitors: 25,
    hasAdvancedReports: true,
    hasAPIAccess: true,
    hasWhiteLabel: true,
    hasCustomBranding: true,
    hasPrioritySupport: true,
    hasTeamCollaboration: true,
    hasCustomAlerts: true,
    hasDataExport: true,
    isPopular: false,
    sortOrder: 3,
  },
  {
    id: 'enterprise',
    name: 'enterprise',
    displayName: 'Enterprise',
    description: 'For large organizations',
    priceMonthly: 16900,
    priceYearly: 162200, 
    maxProjects: 0, 
    maxKeywords: 0, 
    maxAnalysesPerMonth: 1000,
    maxReportsPerMonth: 200,
    maxCompetitors: 100,
    hasAdvancedReports: true,
    hasAPIAccess: true,
    hasWhiteLabel: true,
    hasCustomBranding: true,
    hasPrioritySupport: true,
    hasTeamCollaboration: true,
    hasCustomAlerts: true,
    hasDataExport: true,
    isPopular: false,
    sortOrder: 4,
  },
];
