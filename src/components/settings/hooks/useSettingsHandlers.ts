
import { useSettingsState } from "./useSettingsState";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Logger } from "@/utils/logger";

export function useSettingsHandlers() {
  const state = useSettingsState();
  const { handleError, executeWithErrorHandling } = useErrorHandler({
    component: 'SettingsHandlers',
    showToast: true
  });

  const handleEditProduct = (product: any) => {
    Logger.trace('SettingsHandlers', 'handleEditProduct', { productId: product?.id });
    try {
      state.setEditingProduct(product);
      state.setProductDialogOpen(true);
    } catch (error) {
      handleError(error as Error, { action: 'editProduct', product });
    }
  };

  const handleEditStaffCode = (staffCode: any) => {
    Logger.trace('SettingsHandlers', 'handleEditStaffCode', { staffCodeId: staffCode?.id });
    try {
      state.setEditingStaffCode(staffCode);
      state.setStaffCodeDialogOpen(true);
    } catch (error) {
      handleError(error as Error, { action: 'editStaffCode', staffCode });
    }
  };

  const handleEditTemplate = (template: any) => {
    Logger.trace('SettingsHandlers', 'handleEditTemplate', { templateId: template?.id });
    try {
      state.setEditingTemplate(template);
      state.setTemplateDialogOpen(true);
    } catch (error) {
      handleError(error as Error, { action: 'editTemplate', template });
    }
  };

  const handleProductSuccess = async () => {
    Logger.trace('SettingsHandlers', 'handleProductSuccess');
    await executeWithErrorHandling(async () => {
      state.setProductDialogOpen(false);
      state.setEditingProduct(null);
    }, { action: 'productSuccess' });
  };

  const handleStaffCodeSuccess = async () => {
    Logger.trace('SettingsHandlers', 'handleStaffCodeSuccess');
    await executeWithErrorHandling(async () => {
      state.setStaffCodeDialogOpen(false);
      state.setEditingStaffCode(null);
    }, { action: 'staffCodeSuccess' });
  };

  const handleTemplateSuccess = async () => {
    Logger.trace('SettingsHandlers', 'handleTemplateSuccess');
    await executeWithErrorHandling(async () => {
      state.setTemplateDialogOpen(false);
      state.setEditingTemplate(null);
    }, { action: 'templateSuccess' });
  };

  const handleDrinkSuccess = async () => {
    Logger.trace('SettingsHandlers', 'handleDrinkSuccess');
    await executeWithErrorHandling(async () => {
      state.setDrinkDialogOpen(false);
    }, { action: 'drinkSuccess' });
  };

  const handleAddNewProduct = () => {
    Logger.trace('SettingsHandlers', 'handleAddNewProduct');
    try {
      state.setEditingProduct(null);
      state.setProductDialogOpen(true);
    } catch (error) {
      handleError(error as Error, { action: 'addNewProduct' });
    }
  };

  const handleAddNewDrink = () => {
    Logger.trace('SettingsHandlers', 'handleAddNewDrink');
    try {
      state.setDrinkDialogOpen(true);
    } catch (error) {
      handleError(error as Error, { action: 'addNewDrink' });
    }
  };

  const handleAddNewStaffCode = () => {
    Logger.trace('SettingsHandlers', 'handleAddNewStaffCode');
    try {
      state.setEditingStaffCode(null);
      state.setStaffCodeDialogOpen(true);
    } catch (error) {
      handleError(error as Error, { action: 'addNewStaffCode' });
    }
  };

  const handleAddNewTemplate = () => {
    Logger.trace('SettingsHandlers', 'handleAddNewTemplate');
    try {
      state.setEditingTemplate(null);
      state.setTemplateDialogOpen(true);
    } catch (error) {
      handleError(error as Error, { action: 'addNewTemplate' });
    }
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
      handleDrinkSuccess,
      handleAddNewProduct,
      handleAddNewDrink,
      handleAddNewStaffCode,
      handleAddNewTemplate,
    },
  };
}
