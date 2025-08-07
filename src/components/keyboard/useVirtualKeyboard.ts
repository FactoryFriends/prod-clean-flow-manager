import { useContext } from 'react';
import { VirtualKeyboardContext } from './VirtualKeyboardProvider';

export function useVirtualKeyboard() {
  const context = useContext(VirtualKeyboardContext);
  
  if (!context) {
    throw new Error('useVirtualKeyboard must be used within VirtualKeyboardProvider');
  }
  
  return context;
}