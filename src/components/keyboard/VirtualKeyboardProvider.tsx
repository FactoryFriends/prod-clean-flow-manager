import React, { createContext, useState, useRef, ReactNode } from 'react';

interface VirtualKeyboardContextType {
  isVisible: boolean;
  inputType: 'text' | 'number';
  inputValue: string;
  isShiftActive: boolean;
  show: (inputRef: HTMLInputElement | HTMLTextAreaElement, type?: 'text' | 'number', onChange?: (e: any) => void) => void;
  hide: () => void;
  type: (char: string) => void;
  backspace: () => void;
  clear: () => void;
  space: () => void;
  toggleShift: () => void;
}

export const VirtualKeyboardContext = createContext<VirtualKeyboardContextType | null>(null);

interface VirtualKeyboardProviderProps {
  children: ReactNode;
}

export function VirtualKeyboardProvider({ children }: VirtualKeyboardProviderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [inputType, setInputType] = useState<'text' | 'number'>('text');
  const [inputValue, setInputValue] = useState('');
  const [isShiftActive, setIsShiftActive] = useState(false);
  const activeInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const onChangeHandlerRef = useRef<((e: any) => void) | null>(null);

  const show = (inputRef: HTMLInputElement | HTMLTextAreaElement, type: 'text' | 'number' = 'text', onChange?: (e: any) => void) => {
    activeInputRef.current = inputRef;
    setInputType(type);
    setInputValue(inputRef.value);
    setIsVisible(true);
    setIsShiftActive(false);
    
    // Store the React onChange handler
    onChangeHandlerRef.current = onChange || null;
  };

  const hide = () => {
    setIsVisible(false);
    activeInputRef.current = null;
    onChangeHandlerRef.current = null;
    setIsShiftActive(false);
  };

  const updateInput = (newValue: string) => {
    setInputValue(newValue);
    if (activeInputRef.current) {
      const element = activeInputRef.current;
      
      // Set the value directly
      element.value = newValue;
      
      // Create a synthetic event that mimics React's onChange event
      const mockEvent = {
        target: { value: newValue },
        currentTarget: { value: newValue },
        preventDefault: () => {},
        stopPropagation: () => {}
      };
      
      // Try to call React's onChange handler directly if available
      if (onChangeHandlerRef.current) {
        onChangeHandlerRef.current(mockEvent);
      } else {
        // Fallback: dispatch native events
        const inputEvent = new Event('input', { bubbles: true });
        const changeEvent = new Event('change', { bubbles: true });
        element.dispatchEvent(inputEvent);
        element.dispatchEvent(changeEvent);
      }
    }
  };

  const type = (char: string) => {
    const newValue = inputValue + char;
    updateInput(newValue);
    // Auto-disable shift after typing
    if (isShiftActive) {
      setIsShiftActive(false);
    }
  };

  const backspace = () => {
    const newValue = inputValue.slice(0, -1);
    updateInput(newValue);
  };

  const clear = () => {
    updateInput('');
  };

  const space = () => {
    type(' ');
  };

  const toggleShift = () => {
    setIsShiftActive(!isShiftActive);
  };

  return (
    <VirtualKeyboardContext.Provider
      value={{
        isVisible,
        inputType,
        inputValue,
        isShiftActive,
        show,
        hide,
        type,
        backspace,
        clear,
        space,
        toggleShift,
      }}
    >
      {children}
    </VirtualKeyboardContext.Provider>
  );
}