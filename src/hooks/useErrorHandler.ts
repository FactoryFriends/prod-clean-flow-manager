
import { useState, useCallback } from 'react';
import { Logger } from '@/utils/logger';
import { toast } from '@/components/ui/use-toast';

interface ErrorHandlerOptions {
  component?: string;
  showToast?: boolean;
  fallbackMessage?: string;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error: Error | string, context?: any) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    Logger.error('Error handled by useErrorHandler', {
      component: options.component,
      error: errorObj,
      data: context
    });

    setError(errorObj);

    if (options.showToast !== false) {
      toast({
        title: "Error",
        description: options.fallbackMessage || errorObj.message || 'An unexpected error occurred',
        variant: "destructive",
      });
    }
  }, [options]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    errorContext?: any
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFunction();
      return result;
    } catch (error) {
      handleError(error as Error, errorContext);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling
  };
}
