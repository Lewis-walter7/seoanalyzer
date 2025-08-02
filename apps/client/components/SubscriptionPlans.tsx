'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from './ui/badge';
import { Check, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/components/providers/session-provider';
import { staticSubscriptionPlans } from '@/libs/subscriptionPlans';

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
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const plans = staticSubscriptionPlans.sort((a,b)=>(a.sortOrder??0)-(b.sortOrder??0));
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

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
    // If user is not authenticated, redirect to sign in
    if (!user) {
      toast.error('Please sign in to upgrade your plan');
      // Redirect to login page with return URL
      window.location.href = `/login?callbackUrl=${encodeURIComponent('/pricing')}`;
      return;
    }

    // If user is already on this plan
    if (currentSubscription?.plan?.id === plan.id) {
      toast.info('You are already on this plan');
      return;
    }

    // If it's a free plan, handle differently
    if (plan.priceMonthly === 0) {
      toast.info('You can start using the free plan immediately after signing in');
      return;
    }

    setLoadingPlan(plan.id);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/subscription/pay/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle: billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('No payment link received');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to initiate payment');
    } finally {
      setLoadingPlan(null);
    }
  };

  const formatPrice = (price: number) => {
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
        
        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${billingCycle === 'MONTHLY' ? 'font-semibold text-blue-600' : 'text-gray-600'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingCycle === 'YEARLY' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm ${billingCycle === 'YEARLY' ? 'font-semibold text-blue-600' : 'text-gray-600'}`}>
            Yearly
            <Badge className="ml-1 bg-green-100 text-green-800 text-xs">
              Save 20%
            </Badge>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
                  {formatPrice(getCurrentPrice(plan))}
                </span>
                {getCurrentPrice(plan) > 0 && (
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
                  user ? `Upgrade to ${plan.displayName}` : `Choose ${plan.displayName}`
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
