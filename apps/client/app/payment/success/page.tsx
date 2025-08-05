'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader } from 'lucide-react';
import { useAuth } from '../../components/providers/session-provider';
import toast from 'react-hot-toast';

const PaymentStatusPage = () => {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoice_id');
  const status = searchParams.get('status');
  const { user, login } = useAuth(); // Assuming login also refreshes user context

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'success' && invoiceId) {
      const refreshSubscription = async () => {
        try {
          const response = await fetch(`/api/subscription/status?invoice_id=${invoiceId}`);
          if (!response.ok) {
            throw new Error('Failed to refresh subscription');
          }
          // Assuming the session provider automatically updates on login/refresh
          toast.success('Subscription updated successfully!');
        } catch (err: any) {
          setError(err.message);
          toast.error(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      refreshSubscription();
    } else if (status === 'cancel') {
      setIsLoading(false);
    } else {
      setError('Invalid payment status or missing invoice ID.');
      setIsLoading(false);
    }
  }, [invoiceId, status, login]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
          <div className="flex justify-center">
            <Loader className="w-16 h-16 text-blue-500 animate-spin" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Verifying Payment...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
          <div className="flex justify-center">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Error</h1>
          <p className="text-gray-600">{error}</p>
          <Link href="/dashboard" className="w-full block">
            <button className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg">Go to Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payment Successful!</h1>
          <p className="text-gray-600">Your subscription has been activated. Welcome aboard!</p>
          <Link href="/dashboard" className="w-full block">
            <button className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg">Go to Dashboard</button>
          </Link>
        </div>
      </div>
    );
  }

  return null; // Should not be reached
};

const WrappedPaymentSuccessPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PaymentStatusPage />
  </Suspense>
);

export default WrappedPaymentSuccessPage;

