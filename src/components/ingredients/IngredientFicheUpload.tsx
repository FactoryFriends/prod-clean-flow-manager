
import React from "react";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { toast } from "sonner";

interface IngredientFicheUploadProps {
  control: any;
  ficheFile: File | null;
  uploadingFiche: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fieldValue: string;
}

export function IngredientFicheUpload({
  control,
  ficheFile,
  uploadingFiche,
  onUpload,
  fieldValue
}: IngredientFicheUploadProps) {
  return (
    <FormField
      control={control}
      name="product_fiche_url"
      render={() => (
        <FormItem>
          <FormLabel>Product fiche (optional)</FormLabel>
          <input
            type="file"
            accept="application/pdf"
            onChange={onUpload}
            disabled={uploadingFiche}
            className="block"
          />
          {fieldValue && (
            <a
              href={`https://dtfhwnvclwbknycmcejb.supabase.co/storage/v1/object/public/public-files/${fieldValue}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-primary text-xs underline mt-1"
            >
              Bekijk/upload productfiche
            </a>
          )}
        </FormItem>
      )}
    />
  );
}

export default IngredientFicheUpload;
