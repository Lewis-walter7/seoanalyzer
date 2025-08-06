'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from './ui/badge';
import BillingCycleToggle from './ui/BillingCycleToggle';
import { Check, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/components/providers/session-provider';
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
  analysisFrequencies?: string[];
  isActive?: boolean;
  isPopular?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CurrentSubscription {
  plan: SubscriptionPlan;
  subscription: any;
  remainingQuota: {
    projects: number;
    keywords: number;
    analyses: number;
    reports: number;
    competitors: number;
  };
  usageThisPeriod: {
    projects: number;
    keywords: number;
    analyses: number;
    reports: number;
    competitors: number;
    apiCalls: number;
    exports: number;
    alerts: number;
  };
}

interface SubscriptionPlansProps {
  currentPlan?: string;
  onPlanChange?: (planId: string) => void;
}

export default function SubscriptionPlans({ currentPlan = 'free', onPlanChange }: SubscriptionPlansProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  // Fetch subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        const response = await fetch('/api/subscription/plans');
        if (response.ok) {
          const plansData = await response.json();
          // Sort plans by sortOrder
          const sortedPlans = plansData.sort((a: SubscriptionPlan, b: SubscriptionPlan) => (a.sortOrder || 0) - (b.sortOrder || 0));
          setPlans(sortedPlans);
        } else {
          toast.error('Failed to load subscription plans');
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast.error('An error occurred while loading plans');
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Fetch current subscription
  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      // Only fetch current subscription if user is logged in
      if (user) {
        try {
          const subscriptionResponse = await fetch('/api/subscription/me');
          if (subscriptionResponse.ok) {
            const subscriptionData = await subscriptionResponse.json();
            setCurrentSubscription(subscriptionData);
          }
        } catch (subscriptionError) {
          // Silently handle subscription fetch errors for better UX
          console.log('Could not fetch subscription data:', subscriptionError);
        }
      }
    };

    fetchCurrentSubscription();
  }, [user]);

    const handlePlanSelect = async (plan: SubscriptionPlan) => {
        if (!user) {
            toast.error('Please sign in to upgrade your plan');
            window.location.href = `/login?callbackUrl=${encodeURIComponent('/pricing')}`;
            return;
        }

        if (currentSubscription?.plan?.id === plan.id) {
            toast.info('You are already on this plan');
            return;
        }

        if (plan.priceMonthly === 0) {
            toast.info('You can start using the free plan immediately after signing in');
            return;
        }

        if (plan.id === 'enterprise') {
            window.location.href = 'mailto:support@example.com';
            return;
        }

        // Redirect to the new checkout page
        router.push(`/checkout/${plan.id}?billingCycle=${billingCycle}`);
    };

  const formatPrice = (price: number, planId: string) => {
    if (planId === 'enterprise') return 'Contact Us';
    if (price === 0) return 'Free';
    
    // Convert from cents to dollars
    const dollars = price / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(dollars);
  };

  const getCurrentPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'YEARLY' ? (plan.priceYearly || plan.priceMonthly * 12) : plan.priceMonthly;
  };

  const generateFeatures = (plan: SubscriptionPlan) => {
    const features = [];
    
    // Basic features
    if (plan.maxProjects === 0) {
      features.push('Unlimited projects');
    } else {
      features.push(`${plan.maxProjects} project${plan.maxProjects > 1 ? 's' : ''}`);
    }
    
    if (plan.maxKeywords === 0) {
      features.push('Unlimited keywords');
    } else {
      features.push(`${plan.maxKeywords} keywords per project`);
    }
    
    features.push(`${plan.maxAnalysesPerMonth} analyses per month`);
    features.push(`${plan.maxReportsPerMonth} reports per month`);
    
    if (plan.maxCompetitors > 0) {
      features.push(`Track ${plan.maxCompetitors} competitors`);
    }
    
    // Advanced features
    if (plan.hasAdvancedReports) features.push('Advanced reports');
    if (plan.hasAPIAccess) features.push('API access');
    if (plan.hasWhiteLabel) features.push('White-label reports');
    if (plan.hasCustomBranding) features.push('Custom branding');
    if (plan.hasPrioritySupport) features.push('Priority support');
    if (plan.hasTeamCollaboration) features.push('Team collaboration');
    if (plan.hasCustomAlerts) features.push('Custom alerts');
    if (plan.hasDataExport) features.push('Data export');
    
    return features;
  };

  const isPlanActive = (planId: string) => currentSubscription?.plan?.id === planId;
  const isPlanLoading = (planId: string) => loadingPlan === planId;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Select the perfect plan for your SEO analysis needs
        </p>
        
        <BillingCycleToggle
          billingCycle={billingCycle}
          onChange={setBillingCycle}
        />
      </div>

      {plansLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2 text-lg">Loading subscription plans...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${
              plan.isPopular 
                ? 'border-2 border-blue-500 shadow-lg' 
                : 'border border-gray-200 dark:border-gray-700'
            } ${
              isPlanActive(plan.id) 
                ? 'ring-2 ring-green-500 ring-opacity-50' 
                : ''
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-3 py-1 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Most Popular
                </Badge>
              </div>
            )}

            {isPlanActive(plan.id) && (
              <div className="absolute -top-3 right-4">
                <Badge className="bg-green-500 text-white px-3 py-1">
                  Current Plan
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold">{plan.displayName}</CardTitle>
              <CardDescription className="text-sm">{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {formatPrice(getCurrentPrice(plan), plan.id)}
                </span>
                {getCurrentPrice(plan) > 0 && plan.id !== 'enterprise' && (
                  <span className="text-gray-600 dark:text-gray-400 ml-1">
                    /{billingCycle.toLowerCase()}
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <ul className="space-y-3">
                {generateFeatures(plan).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="pt-4">
              <Button
                className="w-full"
                onClick={() => handlePlanSelect(plan)}
                disabled={isPlanActive(plan.id) || isPlanLoading(plan.id)}
                variant={plan.isPopular ? 'default' : 'outline'}
              >
                {isPlanLoading(plan.id) ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : isPlanActive(plan.id) ? (
                  'Current Plan'
                ) : getCurrentPrice(plan) === 0 ? (
                  user ? 'Get Started' : 'Sign Up Free'
                ) : (
plan.id === 'enterprise' ? (user ? 'Contact Us' : 'Get in Touch') : (user ? `Upgrade to ${plan.displayName}` : `Choose ${plan.displayName}`)
                )}
              </Button>
              
              {/* {!user && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Sign in required to {getCurrentPrice(plan) === 0 ? 'get started' : 'upgrade'}
                </p>
              )} */}
            </CardFooter>
          </Card>
        ))}
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          All plans include a 14-day free trial. Cancel anytime.
        </p>
        <div className="flex justify-center items-center gap-4 text-xs text-gray-500">
          <span>✅ Secure payment</span>
          <span>✅ No hidden fees</span>
          <span>✅ 24/7 support</span>
        </div>
      </div>
    </div>
  );
}
