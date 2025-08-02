export interface ClothingItem {
  id: string;
  name: string;
  clothingItemType: string;
  image: string;
  cleaningIntervalSeconds: number;
  lastCleanedDate: string;
  nextCleaningDate: string;
  isArchived: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClothingItemCreate {
  name: string;
  clothingItemType: string;
  image: string;
  cleaningIntervalSeconds: number;
}

export interface ClothingItemsByType {
  [key: string]: ClothingItem[];
}

export interface CleaningIntervalUpdate {
  message: string;
  modified_count: number;
  item_type: string;
  new_interval_seconds: number;
} 