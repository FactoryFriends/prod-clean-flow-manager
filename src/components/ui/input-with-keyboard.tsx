import React from 'react';
import { Input } from './input';
import { Button } from './button';
import { Keyboard } from 'lucide-react';
import { useVirtualKeyboard } from '@/components/keyboard/useVirtualKeyboard';

interface InputWithKeyboardProps extends React.ComponentProps<typeof Input> {
  enableKeyboard?: boolean;
}

export const InputWithKeyboard = React.forwardRef<HTMLInputElement, InputWithKeyboardProps>(
  ({ enableKeyboard = true, type = 'text', ...props }, ref) => {
    const { show } = useVirtualKeyboard();
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleKeyboardClick = () => {
      const element = inputRef.current;
      if (element) {
        const keyboardType = type === 'number' ? 'number' : 'text';
        show(element, keyboardType);
      }
    };

    return (
      <div className="relative">
        <Input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          type={type}
          {...props}
        />
        {enableKeyboard && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            onClick={handleKeyboardClick}
          >
            <Keyboard className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
);

InputWithKeyboard.displayName = "InputWithKeyboard";