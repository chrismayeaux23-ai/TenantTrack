import React, { useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useUpload } from "@/hooks/use-upload";
import { Button } from "./ui/Button";

interface PhotoUploadGroupProps {
  maxPhotos?: number;
  value: string[];
  onChange: (urls: string[]) => void;
}

export function PhotoUploadGroup({ maxPhotos = 3, value = [], onChange }: PhotoUploadGroupProps) {
  const { uploadFile, isUploading } = useUpload({
    onSuccess: (res) => {
      // The ObjectStorage routing standardizes returning 'objectPath' and we can access it via /objects/...
      const fullUrl = res.objectPath;
      onChange([...value, fullUrl]);
    },
    onError: (err) => {
      console.error("Upload failed", err);
      alert("Failed to upload photo. Please try again.");
    }
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (value.length >= maxPhotos) {
      alert(`You can only upload up to ${maxPhotos} photos.`);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    await uploadFile(file);
    // Reset input
    e.target.value = '';
  };

  const removePhoto = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {value.map((url, idx) => (
          <div key={idx} className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
            <img src={url} alt={`Upload ${idx + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(idx)}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-md transition-colors hover:bg-black/70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        {value.length < maxPhotos && (
          <label className={`
            relative flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 
            rounded-xl border-2 border-dashed border-input bg-transparent 
            transition-colors hover:bg-accent hover:border-primary/50
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}>
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <>
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Add Photo</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {value.length} of {maxPhotos} photos uploaded. Maximum 10MB per file.
      </p>
    </div>
  );
}
