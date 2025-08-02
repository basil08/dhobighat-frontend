import axios from 'axios';
import { ClothingItem, ClothingItemCreate, ClothingItemsByType, CleaningIntervalUpdate } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to convert backend snake_case to frontend camelCase
const convertBackendToFrontend = (backendItem: Record<string, unknown>): ClothingItem => {
  return {
    id: String(backendItem._id || backendItem.id || ''),
    name: String(backendItem.name || ''),
    clothingItemType: String(backendItem.clothingItemType || ''),
    image: String(backendItem.image || ''),
    cleaningIntervalSeconds: Number(backendItem.cleaning_interval_seconds || 0),
    lastCleanedDate: String(backendItem.last_cleaned || ''),
    nextCleaningDate: String(backendItem.next_cleaning_date || ''),
    isArchived: Boolean(backendItem.is_archived || false),
    createdAt: backendItem.created_at ? String(backendItem.created_at) : undefined,
    updatedAt: backendItem.updated_at ? String(backendItem.updated_at) : undefined,
  };
};

// Helper function to convert frontend camelCase to backend snake_case
const convertFrontendToBackend = (frontendItem: ClothingItemCreate): Record<string, unknown> => {
  return {
    name: frontendItem.name,
    clothingItemType: frontendItem.clothingItemType,
    image: frontendItem.image,
    cleaning_interval_seconds: frontendItem.cleaningIntervalSeconds,
    last_cleaned: new Date().toISOString(), // Set to current time for new items
  };
};

export const clothingApi = {
  // Get all clothing items indexed by type
  getAllItems: async (): Promise<ClothingItemsByType> => {
    try {
      const response = await api.get('/clothing-items');
      const backendData = response.data;
      
      // Convert backend data to frontend format
      const frontendData: ClothingItemsByType = {};
      Object.entries(backendData).forEach(([type, items]) => {
        frontendData[type] = (items as Record<string, unknown>[]).map(convertBackendToFrontend);
      });
      
      return frontendData;
    } catch (error) {
      console.error('Failed to get all items:', error);
      throw error;
    }
  },

  // Get a specific clothing item
  getItem: async (id: string): Promise<ClothingItem> => {
    const response = await api.get(`/clothing-items/${id}`);
    return convertBackendToFrontend(response.data);
  },

  // Get items by type
  getItemsByType: async (type: string): Promise<ClothingItem[]> => {
    const response = await api.get(`/clothing-items/type/${type}`);
    return (response.data as Record<string, unknown>[]).map(convertBackendToFrontend);
  },

  // Create a new clothing item
  createItem: async (item: ClothingItemCreate & { imageFile?: File }): Promise<ClothingItem> => {
    if (item.imageFile) {
      // Send as form data with image file
      const formData = new FormData();
      formData.append('name', item.name);
      formData.append('clothingItemType', item.clothingItemType);
      formData.append('cleaning_interval_seconds', item.cleaningIntervalSeconds.toString());
      formData.append('image', item.imageFile);
      
      const response = await api.post('/clothing-items', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return convertBackendToFrontend(response.data);
    } else {
      // Fallback to JSON for backward compatibility
      const backendData = convertFrontendToBackend(item);
      const response = await api.post('/clothing-items', backendData);
      return convertBackendToFrontend(response.data);
    }
  },

  // Update cleaning interval for a specific item
  updateItemCleaningInterval: async (id: string, intervalSeconds: number): Promise<ClothingItem> => {
    const response = await api.put(`/clothing-items/${id}/cleaning-interval?cleaning_interval_seconds=${intervalSeconds}`);
    return convertBackendToFrontend(response.data);
  },

  // Update cleaning interval for all items of a type
  updateTypeCleaningInterval: async (type: string, intervalSeconds: number): Promise<CleaningIntervalUpdate> => {
    const response = await api.put(`/clothing-items/type/${type}/cleaning-interval?cleaning_interval_seconds=${intervalSeconds}`);
    return response.data;
  },

  // Archive a clothing item
  archiveItem: async (id: string): Promise<ClothingItem> => {
    const response = await api.put(`/clothing-items/${id}/archive`);
    return convertBackendToFrontend(response.data);
  },

  // Unarchive a clothing item
  unarchiveItem: async (id: string): Promise<ClothingItem> => {
    const response = await api.put(`/clothing-items/${id}/unarchive`);
    return convertBackendToFrontend(response.data);
  },

  // Get archived clothing items
  getArchivedItems: async (): Promise<ClothingItemsByType> => {
    const response = await api.get('/clothing-items/archived');
    const backendData = response.data;
    
    // Convert backend data to frontend format
    const frontendData: ClothingItemsByType = {};
    Object.entries(backendData).forEach(([type, items]) => {
      frontendData[type] = (items as Record<string, unknown>[]).map(convertBackendToFrontend);
    });
    
    return frontendData;
  },
}; 