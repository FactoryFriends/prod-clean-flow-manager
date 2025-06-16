
import { useEffect, useRef } from 'react';
import { Logger } from '@/utils/logger';

interface DebugOptions {
  logRenders?: boolean;
  logProps?: boolean;
  logStateChanges?: boolean;
  componentName?: string;
}

export function useDebugInfo<T extends Record<string, any>>(
  props: T,
  options: DebugOptions = {}
) {
  const renderCount = useRef(0);
  const prevProps = useRef<T>();
  const componentName = options.componentName || 'Unknown Component';

  useEffect(() => {
    renderCount.current += 1;

    if (options.logRenders) {
      Logger.debug(`${componentName} rendered`, {
        component: componentName,
        data: { renderCount: renderCount.current }
      });
    }

    if (options.logProps && prevProps.current) {
      const changedProps = Object.keys(props).filter(
        key => props[key] !== prevProps.current![key]
      );

      if (changedProps.length > 0) {
        Logger.debug(`${componentName} props changed`, {
          component: componentName,
          data: {
            changedProps,
            newValues: changedProps.reduce((acc, key) => ({
              ...acc,
              [key]: props[key]
            }), {}),
            oldValues: changedProps.reduce((acc, key) => ({
              ...acc,
              [key]: prevProps.current![key]
            }), {})
          }
        });
      }
    }

    prevProps.current = props;
  });

  return {
    renderCount: renderCount.current,
    componentName
  };
}
