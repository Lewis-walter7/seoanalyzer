'use client';

import { useState, useMemo } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { CreditCard, Landmark } from 'lucide-react';

interface PaymentMethodProps {
  onPaymentMethodChange: (method: 'card') => void;
  cardNumber: string;
}

// Card detection logic
const getCardType = (cardNumber: string) => {
  const cleanedCardNumber = cardNumber.replace(/\D/g, '');
  if (/^4/.test(cleanedCardNumber)) return 'Visa';
  if (/^5[1-5]/.test(cleanedCardNumber)) return 'Mastercard';
  if (/^3[47]/.test(cleanedCardNumber)) return 'Amex';
  if (/^6(?:011|5)/.test(cleanedCardNumber)) return 'Discover';
  if (/^3(?:0[0-5]|[68])/.test(cleanedCardNumber)) return 'Diners Club';
  if (/^35(?:2[89]|[3-8])/.test(cleanedCardNumber)) return 'JCB';
  return null;
};

export const PaymentMethod: React.FC<PaymentMethodProps> = ({ onPaymentMethodChange, cardNumber }) => {
  const [selectedMethod, setSelectedMethod] = useState<'card'>('card');

  const detectedCardType = useMemo(() => getCardType(cardNumber), [cardNumber]);

  const handleMethodChange = (method: 'card') => {
    setSelectedMethod(method);
    onPaymentMethodChange(method);
  };

  const getDisplayText = () => {
    if (detectedCardType) {
      return detectedCardType;
    }
    return 'Credit/Debit Card';
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Payment Method</div>
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={() => handleMethodChange('card')}
            className="flex items-center justify-center gap-2 w-full"
          >
            <CreditCard className="h-5 w-5" />
            <span>{getDisplayText()}</span>
            {detectedCardType && (
              <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full">
                Detected
              </span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
