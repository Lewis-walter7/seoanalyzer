'use client';

import { plans } from "@/libs/data";
import Navbar from "./navbar";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../components/audit";


export default function PricingPage() {
  

  return (
    <div className="p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
      <div className="pt-6 pl-6">
        <Breadcrumb>
          <BreadcrumbList className="justify-start">
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-blue-100 hover:text-white transition-colors">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-blue-200" />
              <BreadcrumbItem>
              <BreadcrumbPage className="text-white font-medium">Pricing</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <SubscriptionPlans />
    </div>
  );
}
