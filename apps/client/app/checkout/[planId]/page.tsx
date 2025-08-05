
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/components/providers/session-provider';
import { toast } from 'sonner';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubscriptionPlan {
  id: string;
  displayName: string;
  priceMonthly: number;
  priceYearly?: number;
}

const CheckoutPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const planId = params.planId as string;
  const billingCycle = searchParams.get('billingCycle') as 'MONTHLY' | 'YEARLY';

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');

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
    return billingCycle === 'YEARLY' ? plan.priceYearly ?? plan.priceMonthly * 12 : plan.priceMonthly;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/subscription/pay/charge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingCycle,
          card: {
            number: cardNumber,
            expiry,
            cvc,
            holder: cardHolder,
          },
        }),
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
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Purchase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="font-semibold">{plan.displayName} - {billingCycle}</h3>
            <p className="text-2xl font-bold">${(getPrice() / 100).toFixed(2)}</p>
          </div>
          <form onSubmit={handlePayment}>
            <div className="space-y-4">
              <Input
                placeholder="Cardholder Name"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                required
              />
              <Input
                placeholder="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                required
              />
              <div className="flex space-x-4">
                <Input
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  required
                />
                <Input
                  placeholder="CVC"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full mt-6" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
              Pay ${(getPrice() / 100).toFixed(2)}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const WrappedCheckoutPage = () => (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutPage />
    </Suspense>
  );

export default WrappedCheckoutPage;

