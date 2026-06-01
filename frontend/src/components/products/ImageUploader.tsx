"use client";

import { useRef, useState } from "react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { uploadProductImage } from "@/lib/services/uploads-http";

type ImageUploaderProps = {
  /** Current list of image URLs. The first one is used as the cover image. */
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
};

/**
 * Uploads one or more images to MinIO (via the backend) and keeps an ordered
 * list of their public URLs. The first image acts as the product cover.
 */
export default function ImageUploader({
  value,
  onChange,
  max = 6,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);

    try {
      const remaining = max - value.length;
      const selected = Array.from(files).slice(0, Math.max(0, remaining));
      const uploaded = await Promise.all(
        selected.map((file) => uploadProductImage(file)),
      );
      onChange([...value, ...uploaded.map((u) => u.url)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload image");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const makeCover = (index: number) => {
    if (index === 0) return;
    const next = [...value];
    const [picked] = next.splice(index, 1);
    onChange([picked, ...next]);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {value.map((url, index) => (
          <div
            key={url}
            className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Product image ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {index === 0 && (
              <span className="absolute left-1 top-1 rounded bg-indigo-600 px-1 text-[10px] font-medium text-white">
                Cover
              </span>
            )}
            {index !== 0 && (
              <button
                type="button"
                onClick={() => makeCover(index)}
                className="absolute bottom-1 left-1 rounded bg-white/80 px-1 text-[10px] font-medium text-gray-700 hover:bg-white"
              >
                Set cover
              </button>
            )}
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="absolute right-1 top-1 rounded-full bg-white/80 p-0.5 text-gray-600 hover:bg-white hover:text-red-600"
              aria-label="Remove image"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-500 disabled:opacity-50"
          >
            <PhotoIcon className="h-6 w-6" />
            <span className="mt-1 text-xs">
              {uploading ? "Uploading…" : "Add image"}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-gray-500">
        Up to {max} images (JPG, PNG, WEBP, GIF). The first image is the cover.
      </p>
    </div>
  );
}
