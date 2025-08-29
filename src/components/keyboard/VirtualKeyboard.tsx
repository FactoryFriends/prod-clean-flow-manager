import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Delete, Space } from 'lucide-react';
import { useVirtualKeyboard } from './useVirtualKeyboard';

const QWERTY_LAYOUT = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', '@', '.']
];

const NUMBER_LAYOUT = [
  ['1', '2', '3'],
  ['4', '5', '6'], 
  ['7', '8', '9'],
  ['0', '.', '-']
];

export function VirtualKeyboard() {
  const { 
    isVisible, 
    inputType, 
    inputValue, 
    isShiftActive,
    hide, 
    type, 
    backspace, 
    clear,
    toggleShift,
    space
  } = useVirtualKeyboard();

  if (!isVisible) return null;

  const layout = inputType === 'number' ? NUMBER_LAYOUT : QWERTY_LAYOUT;
  const isNumberMode = inputType === 'number';

  const handleKeyPress = (key: string) => {
    if (isShiftActive && !isNumberMode) {
      type(key.toUpperCase());
    } else {
      type(key);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <Card className="w-full max-w-2xl m-4 p-4 bg-background border-2">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted-foreground">
            Virtual Keyboard ({isNumberMode ? 'Numbers' : 'Text'})
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={hide}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Input Preview */}
        <div className="mb-4 p-2 border rounded bg-muted/20 font-mono text-sm">
          {inputValue || 'Type something...'}
        </div>

        {/* Keyboard Layout */}
        <div className="space-y-2">
          {layout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 justify-center">
              {row.map((key) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  className="min-w-[40px] h-10"
                  onClick={() => handleKeyPress(key)}
                >
                  {isShiftActive && !isNumberMode ? key.toUpperCase() : key}
                </Button>
              ))}
            </div>
          ))}
        </div>

        {/* Action Keys */}
        <div className="flex gap-2 justify-center mt-4">
          {!isNumberMode && (
            <Button
              variant={isShiftActive ? "default" : "outline"}
              size="sm"
              onClick={toggleShift}
            >
              Shift
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={space}
            className="min-w-[120px]"
          >
            <Space className="h-4 w-4 mr-1" />
            Space
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={backspace}
          >
            <Delete className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={clear}
          >
            Clear
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={hide}
            className="min-w-[80px] bg-primary"
          >
            Done
          </Button>
        </div>
      </Card>
    </div>
  );
}