
import React, { useState } from 'react';
import { Eye, X, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

interface PhotoGalleryProps {
  photos: string[];
  title?: string;
}

export function PhotoGallery({ photos, title = "Completion Photos" }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!photos || photos.length === 0) {
    return null;
  }

  const downloadPhoto = async (photoUrl: string, filename: string) => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">{title}</h4>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {photos.map((photoUrl, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={photoUrl}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => setSelectedPhoto(photoUrl)}
              />
            </div>
            
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPhoto(photoUrl)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-white hover:bg-white/20"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Photo Preview
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedPhoto && downloadPhoto(selectedPhoto, `photo-${Date.now()}.jpg`)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedPhoto && (
            <div className="flex justify-center">
              <img
                src={selectedPhoto}
                alt="Full size preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
