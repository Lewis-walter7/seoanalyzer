import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LocalSeoFormProps {
  onSubmit: (data: { name: string; address: string; phone: string; website: string; }) => void;
  isLoading?: boolean;
}

const LocalSeoForm: React.FC<LocalSeoFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', website: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {['name', 'address', 'phone', 'website'].map((field) => (
        <div key={field}>
          <label htmlFor={field} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <input
            id={field}
            name={field}
            value={formData[field] || ''}
            onChange={handleChange}
            placeholder={`Enter ${field}`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            disabled={isLoading}
            required
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={isLoading || !formData.name || !formData.address || !formData.phone || !formData.website}
        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Checking...
          </>
        ) : (
          'Check SEO'
        )}
      </button>
    </form>
  );
};

export default LocalSeoForm;

