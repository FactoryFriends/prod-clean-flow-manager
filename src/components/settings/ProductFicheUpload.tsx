
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProductFicheUploadProps {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export function ProductFicheUpload({ value, onChange, disabled }: ProductFicheUploadProps) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const filePath = `product-fiches/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("public-files")
      .upload(filePath, file, { upsert: true });
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }
    onChange(data?.path || null);
    setUploading(false);
    toast.success("Product fiche uploaded!");
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="fiche-upload">Product fiche (optional)</Label>
      <input
        id="fiche-upload"
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="block"
      />
      {value && (
        <a
          href={`https://dtfhwnvclwbknycmcejb.supabase.co/storage/v1/object/public/public-files/${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-primary text-xs underline mt-1"
        >
          Bekijk/upload productfiche
        </a>
      )}
    </div>
  );
}
