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

  const MAX_FILE_SIZE_MB = 1;
  const RECOMMENDED_WIDTH = 800;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (informational only, resizing will handle the rest)
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File is over ${MAX_FILE_SIZE_MB}MB. We will compress it for you, but for best quality, try a smaller file.`);
    }

    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions (maintain aspect ratio)
          if (width > RECOMMENDED_WIDTH || height > RECOMMENDED_WIDTH) {
            if (width > height) {
              height = Math.round((height * RECOMMENDED_WIDTH) / width);
              width = RECOMMENDED_WIDTH;
            } else {
              width = Math.round((width * RECOMMENDED_WIDTH) / height);
              height = RECOMMENDED_WIDTH;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Use JPEG for better compression/smoothness
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            onImageChange(compressedDataUrl);
          }
          setIsLoading(false);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
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
            onLoad={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            style={{ opacity: 0 }}
          />
          <button
            type="button"
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
              <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Standard size: 800x800px (1:1 Ratio)</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
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