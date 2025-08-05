'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { useAuth } from '../../components/providers/session-provider';

const PaymentCancelPage = () => {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoice_id');
  const status = searchParams.get('status');
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
        <div className="flex justify-center">
          <XCircle className="w-16 h-16 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Payment Cancelled
        </h1>

        <p className="text-gray-600">
          Your payment was cancelled and your subscription was not activated. 
          You can try again at any time.
        </p>

        {invoiceId && (
          <p className="text-sm text-gray-500">
            Invoice ID: {invoiceId}
          </p>
        )}

        <div className="space-y-3">
          <Link href="/pricing" className="w-full block">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Try Again</span>
            </button>
          </Link>

          <Link href="/dashboard" className="w-full block">
            <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
              <span>Go to Dashboard</span>
            </button>
          </Link>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact our{' '}
            <Link 
              href="/contact" 
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const WrappedPaymentCancelPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <PaymentCancelPage />
  </Suspense>
);

export default WrappedPaymentCancelPage;
