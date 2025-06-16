
import { useSettingsState } from "./useSettingsState";

export function useSettingsHandlers() {
  const state = useSettingsState();

  const handleEditProduct = (product: any) => {
    state.setEditingProduct(product);
    state.setProductDialogOpen(true);
  };

  const handleEditStaffCode = (staffCode: any) => {
    state.setEditingStaffCode(staffCode);
    state.setStaffCodeDialogOpen(true);
  };

  const handleEditTemplate = (template: any) => {
    state.setEditingTemplate(template);
    state.setTemplateDialogOpen(true);
  };

  const handleProductSuccess = () => {
    state.setProductDialogOpen(false);
    state.setEditingProduct(null);
  };

  const handleStaffCodeSuccess = () => {
    state.setStaffCodeDialogOpen(false);
    state.setEditingStaffCode(null);
  };

  const handleTemplateSuccess = () => {
    state.setTemplateDialogOpen(false);
    state.setEditingTemplate(null);
  };

  const handleAddNewProduct = () => {
    state.setEditingProduct(null);
    state.setProductDialogOpen(true);
  };

  const handleAddNewDrink = () => {
    state.setEditingProduct(null);
    state.setProductDialogOpen(true);
  };

  const handleAddNewStaffCode = () => {
    state.setEditingStaffCode(null);
    state.setStaffCodeDialogOpen(true);
  };

  const handleAddNewTemplate = () => {
    state.setEditingTemplate(null);
    state.setTemplateDialogOpen(true);
  };

  return {
    ...state,
    handlers: {
      handleEditProduct,
      handleEditStaffCode,
      handleEditTemplate,
      handleProductSuccess,
      handleStaffCodeSuccess,
      handleTemplateSuccess,
      handleAddNewProduct,
      handleAddNewDrink,
      handleAddNewStaffCode,
      handleAddNewTemplate,
    },
  };
}
