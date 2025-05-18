
import React, { useState } from "react";
import { ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FormLabel } from "@/components/ui/form";

interface PlateImageUploadProps {
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
}

const PlateImageUpload: React.FC<PlateImageUploadProps> = ({
  imagePreview,
  setImagePreview,
}) => {
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Image too large",
          description: "Image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <FormLabel className="text-gray-300">Plate Image</FormLabel>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "h-32 w-32 border-2 border-dashed rounded-md flex-center flex-col cursor-pointer",
            imagePreview ? "border-nextplate-orange" : "border-gray-600"
          )}
          onClick={() => document.getElementById("plate-image")?.click()}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Plate preview"
              className="h-full w-full object-cover rounded-md"
            />
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-gray-500" />
              <span className="text-xs text-gray-500 mt-2">Upload Image</span>
            </>
          )}
          <input
            id="plate-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">
            Upload an appetizing image of your dish (optional)
          </p>
          <p className="text-xs text-gray-500">
            Max size: 5MB. Recommended: Square aspect ratio.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlateImageUpload;
