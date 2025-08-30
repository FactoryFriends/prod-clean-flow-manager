import { useState, useCallback } from 'react';
import { Logger } from '@/utils/logger';
import { toast } from '@/hooks/use-toast';

interface ErrorHandlerOptions {
  component?: string;
  showToast?: boolean;
  fallbackMessage?: string;
}

interface ErrorWithCode extends Error {
  code?: string;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error: Error | string, context?: any) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const errorWithCode = errorObj as ErrorWithCode;
    
    // Enhanced error categorization
    const getErrorCategory = (err: ErrorWithCode) => {
      if (err.code === 'PGRST116' || err.message?.includes('permission')) return 'auth';
      if (err.message?.includes('network') || err.message?.includes('fetch')) return 'network';
      if (err.message?.includes('validation') || err.message?.includes('required')) return 'validation';
      return 'unknown';
    };

    const category = getErrorCategory(errorWithCode);
    
    Logger.error('Error handled by useErrorHandler', {
      component: options.component,
      error: errorObj,
      data: { ...context, category }
    });

    setError(errorObj);

    if (options.showToast !== false) {
      const getErrorMessage = () => {
        if (category === 'auth') return "Authentication required. Please sign in to continue.";
        if (category === 'network') return "Network error. Please check your connection and try again.";
        if (category === 'validation') return "Please check your input and try again.";
        return options.fallbackMessage || errorObj.message || 'An unexpected error occurred';
      };

      toast({
        title: "Error",
        description: getErrorMessage(),
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