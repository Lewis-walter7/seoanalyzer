'use client';

import { useState } from 'react';
import { X, Globe, Target, Users, Settings } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/app/components/providers/session-provider';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(50, 'Name must be less than 50 characters'),
  url: z.string().url('Please enter a valid URL'),
  description: z.string().optional(),
  targetKeywords: z.string().optional(),
  competitors: z.string().optional(),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (projectData: CreateProjectFormData) => Promise<void>;
}

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      url: '',
      description: '',
      targetKeywords: '',
      competitors: '',
    },
  });

  const handleSubmit = async (data: CreateProjectFormData) => {
    console.log('🚀 Form submitted with data:', data);
    console.log('🔐 Auth status:', isAuthenticated);
    console.log('📝 Form errors:', form.formState.errors);
    
    if (!isAuthenticated) {
      toast.error('You must be logged in to create a project.');
      router.push('/login');
      return;
    }

    if (isSubmitting) {
      console.log('⚠️ Already submitting, skipping...');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const projectData = {
        name: data.name,
        url: data.url,
        description: data.description || null,
        targetKeywords: typeof data.targetKeywords === 'string'
          ? data.targetKeywords.split(',').map(k => k.trim()).filter(Boolean)
          : data.targetKeywords || [],
        competitors: typeof data.competitors === 'string'
          ? data.competitors.split(',').map(c => c.trim()).filter(Boolean)
          : data.competitors || [],
      };

      console.log('🌐 Creating project with data:', projectData);
      await onProjectCreated(projectData);
      
      // Reset form and close modal on success
      form.reset();
      setCurrentStep(1);
      onClose();
    } catch (error) {
      console.error('❌ Error creating project:', error);
      // Error handling is now done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

const nextStep = () => {
    if (currentStep === 1 && form.formState.errors.name) return;
    if (currentStep === 1 && form.formState.errors.url) return;
    if (currentStep === 2 && form.formState.errors.targetKeywords) return;
    if (currentStep === 2 && form.formState.errors.competitors) return;
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Project</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Step {currentStep} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep
                        ? 'bg-blue-500'
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Globe className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Let&apos;s start with the basics</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  {...form.register('name')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="My Awesome Website"
                  required
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website URL *
                </label>
                <input
                  type="url"
                  {...form.register('url')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com"
                  required
                />
                {form.formState.errors.url && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.url.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  {...form.register('description')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Describe your project..."
                />
              </div>
            </div>
          )}

          {/* Step 2: SEO Settings */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Target className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SEO Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configure your SEO goals</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Keywords (Optional)
                </label>
                <input
                  type="text"
                  {...form.register('targetKeywords')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="seo tools, website analysis, digital marketing"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Separate keywords with commas
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Competitors (Optional)
                </label>
                <input
                  type="text"
                  {...form.register('competitors')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="competitor1.com, competitor2.com"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter competitor URLs separated by commas
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Settings className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review & Create</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Review your project details</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Name:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{form.watch('name')}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">URL:</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{form.watch('url')}</p>
                </div>
                {form.watch('description') && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Description:</span>
                    <p className="text-gray-900 dark:text-white">{form.watch('description')}</p>
                  </div>
                )}
                {form.watch('targetKeywords') && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Keywords:</span>
                    <p className="text-gray-900 dark:text-white">{form.watch('targetKeywords')}</p>
                  </div>
                )}
                {form.watch('competitors') && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Competitors:</span>
                    <p className="text-gray-900 dark:text-white">{form.watch('competitors')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={() => {
                  console.log('🔘 Create Project button clicked');
                  console.log('📝 Form valid:', form.formState.isValid);
                  console.log('🎯 Current form values:', form.getValues());
                  console.log('❌ Form errors:', form.formState.errors);
                }}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
