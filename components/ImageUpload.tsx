'use client';

import { useState, useRef } from 'react';
import { Camera, Upload, X, RotateCcw } from 'lucide-react';
import { processImageForUpload, CroppedImage } from '@/lib/imageUtils';

interface ImageUploadProps {
  onImageSelected: (imageFile: File | null) => void;
  onError: (error: string) => void;
  className?: string;
}

export default function ImageUpload({ onImageSelected, onError, className = '' }: ImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<CroppedImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onError('Please select an image file');
      return;
    }

    try {
      setIsProcessing(true);
      const processed = await processImageForUpload(file);
      setCroppedImage(processed);
      setPreview(processed.preview);
      onImageSelected(processed.file);
    } catch (error) {
      onError('Failed to process image. Please try again.');
      console.error('Image processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const resetImage = () => {
    setPreview(null);
    setCroppedImage(null);
    onImageSelected(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {!preview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Camera className="h-5 w-5" />
                <span>Take Photo</span>
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Upload className="h-5 w-5" />
                <span>Choose File</span>
              </button>
            </div>
            
            <p className="text-sm text-gray-500">
              Images will be automatically cropped to 400x400 pixels
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
            <button
              type="button"
              onClick={resetImage}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex justify-center">
            <button
              type="button"
              onClick={resetImage}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Choose Different Image</span>
            </button>
          </div>
          
          {isProcessing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Processing image...</p>
            </div>
          )}
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />
    </div>
  );
} 