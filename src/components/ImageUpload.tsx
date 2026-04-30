import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string | undefined) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  currentImage, 
  onImageChange, 
  className = '' 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { deleteImage } = useImageUpload();
  const [isLoading, setIsLoading] = React.useState(false);

  const RECOMMENDED_WIDTH = 600;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;


    setIsLoading(true);

    try {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      
      img.onload = () => {
        // Crop to 1:1 aspect ratio
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;

        const targetSize = RECOMMENDED_WIDTH;

        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, sx, sy, size, size, 0, 0, targetSize, targetSize);
          // Use WebP for better compression/smoothness and smaller file size
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.8);
          onImageChange(compressedDataUrl);
        }
        setIsLoading(false);
        URL.revokeObjectURL(objectUrl);
      };
      
      img.onerror = () => {
        alert('Failed to process image');
        setIsLoading(false);
        URL.revokeObjectURL(objectUrl);
      };
      
      img.src = objectUrl;
    } catch (error) {
      console.error('Image processing failed:', error);
      alert('Failed to process image');
      setIsLoading(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (currentImage) {
      try {
        await deleteImage(currentImage);
        onImageChange(undefined);
      } catch (error) {
        console.error('Error removing image:', error);
        // Still remove from UI even if deletion fails
        onImageChange(undefined);
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-black mb-2">Menu Item Image</label>
      
      {currentImage ? (
        <div className="relative max-w-sm mx-auto">
          <img
            src={currentImage}
            alt="Menu item preview"
            className="w-full aspect-square object-cover rounded-[2rem] border border-white/10 shadow-2xl transition-opacity duration-300"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <button
            type="button"
            title="Remove image"
            onClick={handleRemoveImage}
            className="absolute top-4 right-4 p-2 bg-red-500/80 backdrop-blur-md text-white rounded-xl hover:bg-red-500 transition-colors duration-200 shadow-lg"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div
          onClick={triggerFileSelect}
          className="max-w-sm mx-auto w-full aspect-square border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-quali-primary/50 hover:bg-quali-primary/5 transition-all duration-300 group"
        >
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-quali-primary mx-auto mb-4"></div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Processing Image...</p>
            </div>
          ) : (
            <>
              <div className="p-6 bg-white/5 rounded-3xl mb-4 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                <ImageIcon className="h-10 w-10 text-gray-500" />
              </div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">📁 Upload Image</p>
              <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Standard size: 600x600px (1:1 Ratio)</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        title="Upload Image"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      {!currentImage && (
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={triggerFileSelect}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-quali-gradient text-white rounded-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Upload className="h-4 w-4" />
            <span>📁 Upload Image</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;