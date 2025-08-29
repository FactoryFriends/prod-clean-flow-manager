import React, { createContext, useState, useRef, ReactNode } from 'react';

interface VirtualKeyboardContextType {
  isVisible: boolean;
  inputType: 'text' | 'number';
  inputValue: string;
  isShiftActive: boolean;
  show: (inputRef: HTMLInputElement | HTMLTextAreaElement, type?: 'text' | 'number') => void;
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

  const show = (inputRef: HTMLInputElement | HTMLTextAreaElement, type: 'text' | 'number' = 'text') => {
    activeInputRef.current = inputRef;
    setInputType(type);
    setInputValue(inputRef.value);
    setIsVisible(true);
    setIsShiftActive(false);
  };

  const hide = () => {
    setIsVisible(false);
    activeInputRef.current = null;
    setIsShiftActive(false);
  };

  const updateInput = (newValue: string) => {
    setInputValue(newValue);
    if (activeInputRef.current) {
      activeInputRef.current.value = newValue;
      // Trigger both input and change events for React controlled components
      const inputEvent = new Event('input', { bubbles: true });
      const changeEvent = new Event('change', { bubbles: true });
      activeInputRef.current.dispatchEvent(inputEvent);
      activeInputRef.current.dispatchEvent(changeEvent);
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