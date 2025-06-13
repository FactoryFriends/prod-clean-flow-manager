
import React, { useState } from 'react';
import { Camera, Upload, X, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';

interface PhotoUploadProps {
  onPhotosUploaded: (photoUrls: string[]) => void;
  maxPhotos?: number;
  required?: boolean;
}

export function PhotoUpload({ onPhotosUploaded, maxPhotos = 5, required = false }: PhotoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length + selectedFiles.length > maxPhotos) {
      setUploadError(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    setUploadError(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async () => {
    if (selectedFiles.length === 0) {
      if (required) {
        setUploadError('At least one photo is required');
        return;
      }
      onPhotosUploaded([]);
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `cleaning-tasks/${fileName}`;

        const { data, error } = await supabase.storage
          .from('cleaning-photos')
          .upload(filePath, file);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('cleaning-photos')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const photoUrls = await Promise.all(uploadPromises);
      onPhotosUploaded(photoUrls);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error uploading photos:', error);
      setUploadError('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Upload completion photo{maxPhotos > 1 ? 's' : ''}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            multiple={maxPhotos > 1}
            onChange={handleFileChange}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
          >
            <Camera className="w-4 h-4" />
            Take Photo
          </label>
          
          <label
            htmlFor="photo-upload"
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg cursor-pointer hover:bg-accent transition-colors"
          >
            <Upload className="w-4 h-4" />
            Choose File
          </label>
        </div>
        
        <p className="text-xs text-muted-foreground mt-1">
          Maximum {maxPhotos} photo{maxPhotos > 1 ? 's' : ''} allowed
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Photos:</h4>
          <div className="grid grid-cols-2 gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between p-2 bg-accent rounded-lg">
                  <span className="text-sm truncate">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="p-1 h-auto"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-red-700">{uploadError}</span>
        </div>
      )}

      <Button
        onClick={uploadPhotos}
        disabled={uploading || (required && selectedFiles.length === 0)}
        className="w-full"
      >
        {uploading ? 'Uploading...' : 'Upload Photos'}
      </Button>
    </div>
  );
}
