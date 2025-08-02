'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { clothingApi } from '@/lib/api';
import { ClothingItemCreate } from '@/types';
import ImageUpload from '@/components/ImageUpload';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AddItemPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ClothingItemCreate>({
    name: '',
    clothingItemType: '',
    image: '',
    cleaningIntervalSeconds: 7 * 24 * 60 * 60, // 7 days default
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      setError('Please upload an image for the clothing item');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      await clothingApi.createItem({
        ...formData,
        imageFile: imageFile
      });
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create clothing item');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ClothingItemCreate, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageSelected = (file: File | null) => {
    setImageFile(file);
    setImageError(null);
  };

  const handleImageError = (error: string) => {
    setImageError(error);
  };

  const intervalOptions = [
    { label: '1 day', value: 1 * 24 * 60 * 60 },
    { label: '3 days', value: 3 * 24 * 60 * 60 },
    { label: '7 days', value: 7 * 24 * 60 * 60 },
    { label: '14 days', value: 14 * 24 * 60 * 60 },
    { label: '30 days', value: 30 * 24 * 60 * 60 },
    { label: 'Custom', value: 'custom' },
  ];

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Clothing Item</h1>
          <p className="text-gray-600 mt-2">Add a new item to your clothing collection</p>
        </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              placeholder="e.g., Blue Jeans, White T-Shirt"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Clothing Type *
            </label>
            <input
              type="text"
              id="type"
              required
              value={formData.clothingItemType}
              onChange={(e) => handleInputChange('clothingItemType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              placeholder="e.g., Jeans, T-Shirts, Dresses"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Image *
            </label>
            <ImageUpload
              onImageSelected={handleImageSelected}
              onError={handleImageError}
            />
            {imageError && (
              <p className="text-red-600 text-sm mt-2">{imageError}</p>
            )}
            {imageFile && (
              <div className="mt-2">
                <p className="text-green-600 text-sm">✓ Image ready for upload</p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-2">
              Cleaning Interval *
            </label>
            <select
              id="interval"
              value={formData.cleaningIntervalSeconds}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'custom') {
                  // For custom, we'll show a number input
                  setFormData(prev => ({ ...prev, cleaningIntervalSeconds: 7 * 24 * 60 * 60 }));
                } else {
                  handleInputChange('cleaningIntervalSeconds', parseInt(value));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              {intervalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {formData.cleaningIntervalSeconds === 7 * 24 * 60 * 60 && (
            <div>
              <label htmlFor="customInterval" className="block text-sm font-medium text-gray-700 mb-2">
                Custom Interval (days)
              </label>
              <input
                type="number"
                id="customInterval"
                min="1"
                max="365"
                value={Math.round(formData.cleaningIntervalSeconds / (24 * 60 * 60))}
                onChange={(e) => handleInputChange('cleaningIntervalSeconds', parseInt(e.target.value) * 24 * 60 * 60)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !imageFile}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </ProtectedRoute>
  );
} 