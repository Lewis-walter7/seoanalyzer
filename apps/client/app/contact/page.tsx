'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const validationRules = {
  name: {
    required: 'Name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
    maxLength: { value: 50, message: 'Name must not exceed 50 characters' }
  },
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address'
    }
  },
  phone: {
    pattern: {
      value: /^[\+]?[1-9][\d]{0,15}$/,
      message: 'Please enter a valid phone number'
    }
  },
  message: {
    required: 'Message is required',
    minLength: { value: 10, message: 'Message must be at least 10 characters' },
    maxLength: { value: 1000, message: 'Message must not exceed 1000 characters' }
  },
  consent: {
    required: 'You must agree to the terms and conditions'
  }
};

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  message: string;
  consent: boolean;
  recaptchaToken?: string;
}

export default function ContactPage() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ContactFormData>();

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [honeypot, setHoneypot] = useState('');

  const onSubmit = async (data: ContactFormData) => {
    if (honeypot) return;

    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'contact_form_submission', {
          event_category: 'engagement',
          event_label: data.department || 'general'
        });
      }

      let recaptchaToken = '';
      if (typeof window !== 'undefined' && (window as any).grecaptcha) {
        try {
          recaptchaToken = await (window as any).grecaptcha.execute(
            'YOUR_RECAPTCHA_SITE_KEY',
            { action: 'contact' }
          );
        } catch (error) {
          console.warn('reCAPTCHA execution failed:', error);
        }
      }

      const formData = {
        ...data,
        recaptchaToken,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      const response = await axios.post('/api/contact', formData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.status === 200) {
        setSubmitStatus('success');
        toast.success("Your message has been sent successfully! We'll get back to you soon.");
        reset();

        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'contact_form_success', {
            event_category: 'engagement'
          });
        }
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Contact form submission error:', error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          toast.error('Too many requests. Please try again later.');
        } else if (typeof error.response?.status === 'number' && error.response.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error('Failed to send message. Please check your input and try again.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'contact_form_error', {
          event_category: 'engagement',
          event_label: error instanceof Error ? error.message : 'unknown_error'
        });
      }
    }
  };

  return (
    <main className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      <div className="py-4">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList className="justify-start">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="text-blue-100 hover:text-white transition-colors">
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-blue-200" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white font-medium">Contact Us</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Get in <span className="text-yellow-300">Touch</span>
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Send us a Message
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                  Fill out the form below and we&apos;ll get back to you within 24 hours
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    style={{ display: 'none' }}
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  <Controller
                    name="name"
                    control={control}
                    rules={validationRules.name}
                    render={({ field }) => (
                      <Input
                        label="Name"
                        {...field}
                        error={errors.name?.message}
                        placeholder="Enter your full name"
                        required
                      />
                    )}
                  />

                  <Controller
                    name="email"
                    control={control}
                    rules={validationRules.email}
                    render={({ field }) => (
                      <Input
                        label="Email"
                        type="email"
                        {...field}
                        error={errors.email?.message}
                        placeholder="your.email@example.com"
                        required
                      />
                    )}
                  />

                  <Controller
                    name="phone"
                    control={control}
                    rules={validationRules.phone}
                    render={({ field }) => (
                      <Input
                        label="Phone"
                        type="tel"
                        {...field}
                        error={errors.phone?.message}
                        helperText="Optional"
                        placeholder="+1 (555) 123-4567"
                      />
                    )}
                  />

                  <Controller
                    name="department"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">
                          Department
                          <span className="text-muted-foreground ml-1">(Optional)</span>
                        </label>
                        <select
                          {...field}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select department</option>
                          <option value="sales">Sales</option>
                          <option value="support">Support</option>
                          <option value="marketing">Marketing</option>
                          <option value="general">General Inquiry</option>
                        </select>
                      </div>
                    )}
                  />

                  <Controller
                    name="message"
                    control={control}
                    rules={validationRules.message}
                    render={({ field }) => (
                      <Textarea
                        label="Message"
                        {...field}
                        error={errors.message?.message}
                        placeholder="Tell us how we can help you..."
                        rows={5}
                        required
                      />
                    )}
                  />

                  <Controller
                    name="consent"
                    control={control}
                    rules={validationRules.consent}
                    render={({ field: { value, onChange, ...field } }) => (
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            id="consent"
                            {...field}
                            checked={value || false}
                            onChange={(e) => onChange(e.target.checked)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            required
                          />
                          <label htmlFor="consent" className="text-sm text-foreground">
                            I agree to the{' '}
                            <a href="/terms" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              terms and conditions
                            </a>{' '}
                            and{' '}
                            <a href="/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                              privacy policy
                            </a>
                            . <span className="text-destructive">*</span>
                          </label>
                        </div>
                        {errors.consent && (
                          <p className="text-xs text-destructive">{errors.consent.message}</p>
                        )}
                      </div>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </Button>

                  {submitStatus === 'success' && (
                    <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            Message sent successfully! We&apos;ll get back to you soon.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Office</h2>
            <div className="space-y-4 mb-6">
              {/* office info */}
            </div>
            <iframe
              src="https://www.google.com/maps/embed?pb=..."
              width="100%"
              height="250"
              className="border-0 shadow-lg rounded-lg"
              allowFullScreen={false}
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>
    </main>
  );
}
