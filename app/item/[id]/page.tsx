'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { clothingApi } from '@/lib/api';
import { ClothingItem } from '@/types';
import { format } from 'date-fns';
import { ArrowLeftIcon, ArchiveIcon, RotateCcwIcon } from 'lucide-react';
import Link from 'next/link';
import ClothingItemImage from '@/components/ClothingItemImage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ItemPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;
  
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newInterval, setNewInterval] = useState<number>(0);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const data = await clothingApi.getItem(itemId);
      setItem(data);
      setNewInterval(data.cleaningIntervalSeconds);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load clothing item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInterval = async () => {
    if (!item) return;
    
    try {
      setUpdating(true);
      const updatedItem = await clothingApi.updateItemCleaningInterval(itemId, newInterval);
      setItem(updatedItem);
      setNewInterval(updatedItem.cleaningIntervalSeconds);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update cleaning interval');
    } finally {
      setUpdating(false);
    }
  };

  const handleArchive = async () => {
    if (!item) return;
    
    try {
      setArchiving(true);
      const archivedItem = await clothingApi.archiveItem(itemId);
      setItem(archivedItem);
      // Redirect to home page after archiving
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to archive item');
    } finally {
      setArchiving(false);
    }
  };

  const handleUnarchive = async () => {
    if (!item) return;
    
    try {
      setArchiving(true);
      const unarchivedItem = await clothingApi.unarchiveItem(itemId);
      setItem(unarchivedItem);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to unarchive item');
    } finally {
      setArchiving(false);
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
          onClick={loadItem}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Item not found</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          Back to Home
        </Link>
      </div>
    );
  }

  const daysUntil = getDaysUntilCleaning(item.nextCleaningDate);

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-4 sm:mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-3 sm:mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to All Items
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{item.name}</h1>
          <p className="text-gray-600 mt-2">Clothing Item Details</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Item Image */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Item Image</h2>
            <div className="flex justify-center">
              <ClothingItemImage
                imageUrl={item.image}
                alt={item.name}
                size="lg"
                className="w-32 h-32 sm:w-48 sm:h-48"
              />
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Item Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-lg text-gray-900">{item.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <Link
                  href={`/type/${encodeURIComponent(item.clothingItemType)}`}
                  className="text-lg text-blue-600 hover:text-blue-800"
                >
                  {item.clothingItemType}
                </Link>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Cleaning Interval</label>
                <p className="text-lg text-gray-900">
                  {Math.round(item.cleaningIntervalSeconds / 86400)} days
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Cleaned</label>
                <p className="text-lg text-gray-900">{formatDate(item.lastCleanedDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Next Cleaning</label>
                <p className={`text-lg ${getStatusColor(daysUntil)}`}>
                  {formatDate(item.nextCleaningDate)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  {daysUntil <= 0 ? (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      Needs cleaning
                    </span>
                  ) : daysUntil <= 3 ? (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                      Due soon ({daysUntil} days)
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {daysUntil} days left
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Archive Status</label>
                <div className="mt-1">
                  {item.isArchived ? (
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      Archived
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Update Cleaning Interval */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Update Cleaning Interval</h2>
          <div className="space-y-4">
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
              disabled={updating || newInterval === item.cleaningIntervalSeconds}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {updating ? 'Updating...' : 'Update Interval'}
            </button>
            {newInterval !== item.cleaningIntervalSeconds && (
              <p className="text-sm text-gray-600">
                This will update the cleaning interval for this specific item only.
              </p>
            )}
          </div>
        </div>

        {/* Archive/Unarchive Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              {item.isArchived ? 'Unarchive Item' : 'Archive Item'}
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {item.isArchived 
                  ? 'Unarchive this item to make it active again and include it in your cleaning schedule.'
                  : 'Archive this item to hide it from your main list. Archived items are not included in cleaning schedules.'
                }
              </p>
              <button
                onClick={item.isArchived ? handleUnarchive : handleArchive}
                disabled={archiving}
                className={`w-full px-4 py-2 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 ${
                  item.isArchived 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {archiving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {item.isArchived ? (
                      <>
                        <RotateCcwIcon className="h-4 w-4" />
                        <span>Unarchive Item</span>
                      </>
                    ) : (
                      <>
                        <ArchiveIcon className="h-4 w-4" />
                        <span>Archive Item</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  );
} 