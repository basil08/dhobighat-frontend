'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { clothingApi } from '@/lib/api';
import { ClothingItem } from '@/types';
import { format } from 'date-fns';
import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import ClothingItemImage from '@/components/ClothingItemImage';

export default function TypePage() {
  const params = useParams();
  const itemType = decodeURIComponent(params.type as string);
  
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newInterval, setNewInterval] = useState<number>(0);
  const [currentInterval, setCurrentInterval] = useState<number>(0);

  useEffect(() => {
    loadItems();
  }, [itemType]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await clothingApi.getItemsByType(itemType);
      setItems(data);
      if (data.length > 0) {
        setCurrentInterval(data[0].cleaningIntervalSeconds);
        setNewInterval(data[0].cleaningIntervalSeconds);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load clothing items');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInterval = async () => {
    try {
      setUpdating(true);
      await clothingApi.updateTypeCleaningInterval(itemType, newInterval);
      // Reload items to get updated data
      await loadItems();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update cleaning interval');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getDaysUntilCleaning = (nextCleaningDate: string) => {
    const nextDate = new Date(nextCleaningDate);
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (daysUntil: number) => {
    if (daysUntil <= 0) return 'text-red-600';
    if (daysUntil <= 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadItems}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="mb-4 sm:mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-3 sm:mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to All Items
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{itemType}</h1>
        <p className="text-gray-600 mt-2">
          {items.length} item{items.length !== 1 ? 's' : ''} of this type
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Update Type Cleaning Interval */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Update Type Interval</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Interval
                </label>
                <p className="text-lg text-gray-900">
                  {Math.round(currentInterval / 86400)} days
                </p>
              </div>
              <div>
                <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-2">
                  New Cleaning Interval (days)
                </label>
                <input
                  type="number"
                  id="interval"
                  min="1"
                  max="365"
                  value={Math.round(newInterval / 86400)}
                  onChange={(e) => setNewInterval(parseInt(e.target.value) * 86400)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                />
              </div>
              <button
                onClick={handleUpdateInterval}
                disabled={updating || newInterval === currentInterval}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {updating ? 'Updating...' : 'Update All Items'}
              </button>
              {newInterval !== currentInterval && (
                <p className="text-sm text-gray-600">
                  This will update the cleaning interval for all {items.length} item{items.length !== 1 ? 's' : ''} of this type.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Items</h2>
            </div>
            {items.length === 0 ? (
              <div className="p-4 sm:p-6 text-center text-gray-500">
                No items found for this type.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {items.map((item) => {
                  const daysUntil = getDaysUntilCleaning(item.nextCleaningDate);
                  return (
                    <Link
                      key={item.id}
                      href={`/item/${item.id}`}
                      className="block px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <ClothingItemImage
                            imageUrl={item.image}
                            alt={item.name}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                              {item.name}
                            </h3>
                            <div className="mt-1 flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                              <span className="truncate">
                                Last cleaned: {formatDate(item.lastCleanedDate)}
                              </span>
                              <span className="truncate">
                                Next cleaning: {formatDate(item.nextCleaningDate)}
                              </span>
                              <span className="truncate">
                                Interval: {Math.round(item.cleaningIntervalSeconds / 86400)} days
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-2">
                          {daysUntil <= 0 ? (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                              Needs cleaning
                            </span>
                          ) : daysUntil <= 3 ? (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                              Due soon ({daysUntil} days)
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                              {daysUntil} days left
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 