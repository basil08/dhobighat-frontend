import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface ClothingItemImageProps {
  imageUrl: string;
  alt: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ClothingItemImage({ 
  imageUrl, 
  alt, 
  className = '', 
  size = 'md' 
}: ClothingItemImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-10 h-10 sm:w-12 sm:h-12',
    md: 'w-12 h-12 sm:w-16 sm:h-16',
    lg: 'w-20 h-20 sm:w-24 sm:h-24'
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  if (!imageUrl || imageUrl.trim() === '') {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <ImageIcon className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
      </div>
    );
  }

  if (imageError) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <ImageIcon className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`w-full h-full object-cover rounded-lg ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
} 