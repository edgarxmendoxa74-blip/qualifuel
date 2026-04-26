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

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    // Use Base64 encoding for immediate preview (works without server)
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageChange(reader.result as string);
      setIsLoading(false);
    };
    reader.onerror = () => {
      alert('Failed to read image file');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);

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
        <div className="relative">
          <img
            src={currentImage}
            alt="Menu item preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-300 transition-opacity duration-300"
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
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={triggerFileSelect}
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-chick-orange hover:bg-chick-beige transition-all duration-200"
        >
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chick-orange mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading image...</p>
            </div>
          ) : (
            <>
              <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1 font-medium">📁 Click to upload image</p>
              <p className="text-xs text-gray-500">All formats & quality accepted</p>
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
            className="flex items-center space-x-2 px-4 py-2 bg-chick-gradient text-white rounded-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Upload className="h-4 w-4" />
            <span>📁 Upload Image</span>
          </button>
          <span className="text-sm text-gray-500">or enter URL below</span>
        </div>
      )}

      {/* OR Divider */}
      <div className="flex items-center gap-2">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="text-xs text-gray-500 font-medium">OR</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* URL Input as fallback */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Image URL</label>
        <input
          type="text"
          value={currentImage || ''}
          onChange={(e) => onImageChange(e.target.value || undefined)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chick-orange focus:border-transparent"
          placeholder="/images/chick-central-logo.jpg or https://..."
          disabled={isLoading}
        />
        
        {/* Quick Path Helper */}
        <button
          type="button"
          onClick={() => onImageChange('/images/chick-central-logo.jpg')}
          className="text-xs px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
        >
          🐔 Use Chick Central Logo
        </button>
        
        <p className="text-xs text-gray-500">
          💡 <strong>Supports:</strong> All image formats • Any quality/size • Upload file or enter URL
        </p>
        <p className="text-xs text-gray-400">
          ✨ Low quality images are welcome! Upload any image you have.
        </p>
      </div>
    </div>
  );
};

export default ImageUpload;