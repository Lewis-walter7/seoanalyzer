
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/components/providers/session-provider';
import { toast } from 'sonner';
import { Loader2, Lock, CreditCard, Calendar, Shield, User, Check, Mail, Zap, Users, Share2, Building2, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BillingCycleToggle from '@/components/ui/BillingCycleToggle';
import { PaymentMethod } from '@/components/ui/payment-method';

interface SubscriptionPlan {
  id: string;
  displayName: string;
  priceMonthly: number;
  priceYearly?: number;
  analyses?: number;
  features?: string[];
  description?: string;
}

const CheckoutPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const planId = params.planId as string;
  const urlBillingCycle = searchParams.get('billingCycle') as 'MONTHLY' | 'YEARLY';

  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>(
    urlBillingCycle || 'MONTHLY'
  );

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card'>('card');

  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);

  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set('billingCycle', billingCycle);
    router.replace(`/checkout/${planId}?${currentParams.toString()}`, { scroll: false });
  }, [billingCycle, planId, router, searchParams]);

  useEffect(() => {
    if (!planId) return;

    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/subscription/plans`);
        if (response.ok) {
          const plans = await response.json();
          const selectedPlan = plans.find((p: SubscriptionPlan) => p.id === planId);
          if (selectedPlan) {
            setPlan(selectedPlan);
          } else {
            toast.error('Invalid subscription plan.');
            router.push('/pricing');
          }
        } else {
          toast.error('Failed to load plan details.');
        }
      } catch (error) {
        toast.error('An error occurred while fetching plan details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId, router]);

  const getPrice = () => {
    if (!plan) return 0;
    return billingCycle === 'YEARLY'
      ? plan.priceYearly ?? plan.priceMonthly * 12
      : plan.priceMonthly;
  };

  const getPlanDescription = () => {
    if (!plan) return '';
    
    // If plan has a description, use it
    if (plan.description) {
      return plan.description;
    }
    
    // If plan has analyses count, format it
    if (plan.analyses) {
      const analysesText = plan.analyses === -1 ? 'Unlimited' : plan.analyses.toLocaleString();
      return `${analysesText} analyses per month`;
    }
    
    // Fallback based on plan ID
    switch (plan.id.toLowerCase()) {
      case 'pro':
        return '2,500 analyses per month';
      case 'basic':
        return '100 analyses per month';
      case 'premium':
      case 'enterprise':
        return 'Unlimited analyses';
      default:
        return 'Premium features included';
    }
  };

  const getPlanTitle = () => {
    if (!plan) return 'Subscribe to Plan';
    return `Subscribe to ${plan.displayName || plan.id} Plan`;
  };

  const getCurrentPrice = () => {
    if (!plan) return 0;
    return billingCycle === 'YEARLY'
      ? plan.priceYearly ?? plan.priceMonthly * 12
      : plan.priceMonthly;
  };

  const getYearlySavings = () => {
    if (!plan || !plan.priceYearly) return 0;
    const monthlyTotal = plan.priceMonthly * 12;
    return monthlyTotal - plan.priceYearly;
  };

  const applyPromoCode = () => {
    // Simple demo promo codes - in real app, this would call an API
    const promoCodes = {
      'SAVE10': 1000, // $10 off in cents
      'WELCOME20': 2000, // $20 off in cents
      'FIRST50': 5000, // $50 off in cents
    };

    const discountAmount = promoCodes[promoCode.toUpperCase() as keyof typeof promoCodes];
    
    if (discountAmount) {
      setPromoDiscount(discountAmount);
      toast.success(`Promo code applied! You saved $${(discountAmount / 100).toFixed(2)}`);
      setShowPromoInput(false);
    } else {
      toast.error('Invalid promo code. Please try again.');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/subscription/pay/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId,
          billingCycle,
          card: {
            number: cardNumber,
            expiry,
            cvc,
            holder: name
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Payment successful! Your subscription is active.');
        router.push('/payment/success');
      } else {
        toast.error(data.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred during payment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{getPlanTitle()}</h2>

              <div className="mb-6">
                <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  ${(getCurrentPrice() / 100).toFixed(2)} 
                  <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                    per {billingCycle === 'YEARLY' ? 'year' : 'month'}
                  </span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{getPlanDescription()}</p>
              </div>

              <BillingCycleToggle
                billingCycle={billingCycle}
                onChange={setBillingCycle}
              />

              {billingCycle === 'YEARLY' && (
                <div className="text-green-600 dark:text-green-400 font-semibold mb-6">
                  💚 Save $36 with annual billing → $180.00/year
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                    <span>Subtotal</span>
                    <span>${(getPrice() / 100).toFixed(2)}</span>
                  </div>

                  {promoDiscount > 0 && (
                    <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                      <span>Promo Discount</span>
                      <span>-${(promoDiscount / 100).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>

                  {!showPromoInput && (
                    <Button variant="link" onClick={() => setShowPromoInput(true)} className="p-0 h-auto text-blue-600 hover:text-blue-500">
                      <Tag className="w-4 h-4 mr-2" />
                      Add promo code
                    </Button>
                  )}

                  {showPromoInput && (
                    <div className="flex gap-2 pt-2">
                      <Input
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                      />
                      <Button onClick={applyPromoCode}>Apply</Button>
                      <Button variant="ghost" onClick={() => setShowPromoInput(false)}><X className="w-4 h-4" /></Button>
                    </div>
                  )}

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <div className="flex justify-between items-center font-semibold text-gray-900 dark:text-white">
                      <span>Total due today</span>
                      <span>${((getPrice() - promoDiscount) / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              {/* Contact Information Header */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact Information</h3>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{user?.email || 'No email available'}</span>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-6">
                <PaymentMethod onPaymentMethodChange={setPaymentMethod} cardNumber={cardNumber} />

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    autoComplete="cc-name"
                    required
                  />
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Number</label>
                      <Input
                        id="card-number"
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        autoComplete="cc-number"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
                        <Input
                          id="expiry-date"
                          type="text"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="MM/YY"
                          autoComplete="cc-exp"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CVC</label>
                        <Input
                          id="cvc"
                          type="text"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value)}
                          placeholder="CVC"
                          autoComplete="cc-csc"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4 mr-2" />
                  )}
                  Subscribe
                </Button>

                {/* Terms and Legal Disclaimer */}
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-2">
                  <p className='text-center'>
                    By subscribing, you authorize Rank Rover to charge you according to the terms until you cancel.
                  </p>
                  <p className='text-center'>
                    By placing your order, you agree to our{" "}
                    <a href="/terms" className="text-blue-600 hover:text-blue-500 underline">
                      Terms of Service
                    </a>
                    {" "}and{" "}
                    <a href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                      Privacy Policy
                    </a>
                    .
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const WrappedCheckoutPage = () => (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutPage />
    </Suspense>
  );

export default WrappedCheckoutPage;

