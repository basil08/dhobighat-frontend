'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { clothingApi } from '@/lib/api';
import { ClothingItemsByType, ClothingItem } from '@/types';
import Link from 'next/link';
import { format } from 'date-fns';
import ClothingItemImage from '@/components/ClothingItemImage';

export default function HomePage() {
  const [itemsByType, setItemsByType] = useState<ClothingItemsByType>({});
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await clothingApi.getAllItems();
      setItemsByType(data);
      // Expand all types by default
      setExpandedTypes(new Set(Object.keys(data)));
    } catch (err) {
      setError('Failed to load clothing items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleType = (type: string) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedTypes(newExpanded);
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
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Clothing Items</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Link
            href="/archive"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
          >
            View Archived
          </Link>
          <Link
            href="/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Add New Item
          </Link>
        </div>
      </div>

      {Object.keys(itemsByType).length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <p className="text-gray-500 text-base sm:text-lg">No clothing items found.</p>
          <Link
            href="/add"
            className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
          >
            Add your first item
          </Link>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {Object.entries(itemsByType).map(([type, items]) => (
            <div key={type} className="bg-white rounded-lg shadow-sm border">
              <button
                onClick={() => toggleType(type)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {expandedTypes.has(type) ? (
                    <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  )}
                  <Link
                    href={`/type/${encodeURIComponent(type)}`}
                    className="text-base sm:text-lg font-semibold text-gray-900 hover:text-blue-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {type}
                  </Link>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs sm:text-sm">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </button>

              {expandedTypes.has(type) && (
                <div className="border-t border-gray-100">
                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
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
                            {(() => {
                              const daysUntil = getDaysUntilCleaning(item.nextCleaningDate);
                              if (daysUntil <= 0) {
                                return (
                                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                                    Needs cleaning
                                  </span>
                                );
                              } else if (daysUntil <= 3) {
                                return (
                                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                                    Due soon ({daysUntil} days)
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                                    {daysUntil} days left
                                  </span>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 