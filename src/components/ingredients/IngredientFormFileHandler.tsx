
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { IngredientFormData } from "./types";

interface IngredientFormFileHandlerProps {
  form: UseFormReturn<IngredientFormData>;
}

export function useIngredientFormFileHandler({ form }: IngredientFormFileHandlerProps) {
  const [ficheFile, setFicheFile] = useState<File | null>(null);
  const [uploadingFiche, setUploadingFiche] = useState(false);

  async function handleFicheUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFiche(true);
    const filePath = `product-fiches/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("public-files")
      .upload(filePath, file, { upsert: true });
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploadingFiche(false);
      return;
    }
    setFicheFile(file);
    form.setValue("product_fiche_url", data?.path || "");
    setUploadingFiche(false);
    toast.success("Product fiche uploaded!");
  }

  return { ficheFile, uploadingFiche, handleFicheUpload };
}
