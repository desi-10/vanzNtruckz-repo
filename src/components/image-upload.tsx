"use client";

import { CameraIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value?: string | null;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState(value);

  const handleUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onChange?.(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  return (
    <div className="space-y-4 w-[200px] flex flex-col items-center justify-center">
      <div className="relative aspect-square w-40 overflow-hidden rounded-full border border-border">
        {preview ? (
          <Image
            src={preview}
            alt="Upload preview"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary">
            <CameraIcon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="imageUpload"
        onChange={handleUpload}
        disabled={disabled}
      />
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className="w-full"
        onClick={() => document.getElementById("imageUpload")?.click()}
      >
        Change Image
      </Button>
    </div>
  );
}
