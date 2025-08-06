'use client';

import { Badge } from './badge';

interface BillingCycleToggleProps {
  billingCycle: 'MONTHLY' | 'YEARLY';
  onChange: (billingCycle: 'MONTHLY' | 'YEARLY') => void;
  className?: string;
}

export default function BillingCycleToggle({ billingCycle, onChange, className = "mb-8" }: BillingCycleToggleProps) {
  const handleToggle = () => {
    onChange(billingCycle === 'MONTHLY' ? 'YEARLY' : 'MONTHLY');
  };

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <span className={`text-sm ${billingCycle === 'MONTHLY' ? 'font-semibold text-blue-600' : 'text-gray-600'}`}>
        Monthly
      </span>
      <button
        type="button"
        onClick={handleToggle}
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
  );
}
