
import { useState } from "react";

export function useSettingsState() {
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingStaffCode, setEditingStaffCode] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editingChef, setEditingChef] = useState<any>(null);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [staffCodeDialogOpen, setStaffCodeDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [drinkDialogOpen, setDrinkDialogOpen] = useState(false);
  const [chefDialogOpen, setChefDialogOpen] = useState(false);
  
  // Filter states
  const [productFilter, setProductFilter] = useState("");
  const [drinkFilter, setDrinkFilter] = useState("");
  const [staffCodeFilter, setStaffCodeFilter] = useState("");
  const [templateFilter, setTemplateFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [chefFilter, setChefFilter] = useState("");

  return {
    // Editing states
    editingProduct,
    setEditingProduct,
    editingStaffCode,
    setEditingStaffCode,
    editingTemplate,
    setEditingTemplate,
    editingChef,
    setEditingChef,
    
    // Dialog states
    productDialogOpen,
    setProductDialogOpen,
    staffCodeDialogOpen,
    setStaffCodeDialogOpen,
    templateDialogOpen,
    setTemplateDialogOpen,
    drinkDialogOpen,
    setDrinkDialogOpen,
    chefDialogOpen,
    setChefDialogOpen,
    
    // Filter states
    productFilter,
    setProductFilter,
    drinkFilter,
    setDrinkFilter,
    staffCodeFilter,
    setStaffCodeFilter,
    templateFilter,
    setTemplateFilter,
    customerFilter,
    setCustomerFilter,
    chefFilter,
    setChefFilter,
  };
}
