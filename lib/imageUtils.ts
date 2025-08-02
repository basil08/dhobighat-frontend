export interface CroppedImage {
  file: File;
  preview: string;
}

export const cropImageToSquare = (file: File, size: number = 400): Promise<CroppedImage> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size to target size
      canvas.width = size;
      canvas.height = size;
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Calculate dimensions to maintain aspect ratio
      const aspectRatio = img.width / img.height;
      let drawWidth = size;
      let drawHeight = size;
      let offsetX = 0;
      let offsetY = 0;
      
      if (aspectRatio > 1) {
        // Image is wider than tall
        drawHeight = size / aspectRatio;
        offsetY = (size - drawHeight) / 2;
      } else {
        // Image is taller than wide
        drawWidth = size * aspectRatio;
        offsetX = (size - drawWidth) / 2;
      }
      
      // Draw the image centered and scaled
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      
      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            resolve({
              file: croppedFile,
              preview: canvas.toDataURL('image/jpeg', 0.8),
            });
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        0.8 // Compression quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const compressImage = (file: File, maxSizeKB: number = 500): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions to reduce file size
      let { width, height } = img;
      const maxDimension = 1200; // Max dimension to prevent too large images
      
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Start with high quality and reduce if needed
      let quality = 0.9;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const sizeKB = blob.size / 1024;
              if (sizeKB <= maxSizeKB || quality <= 0.1) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      tryCompress();
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

export const processImageForUpload = async (file: File): Promise<CroppedImage> => {
  // First compress the image
  const compressedFile = await compressImage(file);
  
  // Then crop to 400x400
  const croppedImage = await cropImageToSquare(compressedFile, 400);
  
  return croppedImage;
}; 