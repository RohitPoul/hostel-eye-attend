
import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhotoUploaderProps {
  initialPreview?: string | null;
  onPhotoChange: (file: File | null, preview: string | null) => void;
}

const PhotoUploader = ({ initialPreview, onPhotoChange }: PhotoUploaderProps) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialPreview || null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);
      setPhotoPreview(preview);
      onPhotoChange(file, preview);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    onPhotoChange(null, null);
  };

  return (
    <div className="space-y-2">
      <Label>Student Photo</Label>
      {photoPreview ? (
        <div className="relative h-32 w-32 rounded-md overflow-hidden border">
          <img
            src={photoPreview}
            alt="Student"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center"
            onClick={removePhoto}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div 
          className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => document.getElementById('photo')?.click()}
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <span className="text-sm text-gray-500 mt-2">Upload Photo</span>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
