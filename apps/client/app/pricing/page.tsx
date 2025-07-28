'use client';

import { plans } from "@/libs/data";
import Navbar from "./navbar";
import SubscriptionPlans from "@/components/SubscriptionPlans";


export default function PricingPage() {
  

  return (
    <div className="p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
      <Navbar />
      <SubscriptionPlans />
    </div>
  );
}
