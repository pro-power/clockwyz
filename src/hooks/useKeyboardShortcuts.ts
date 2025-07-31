// src/hooks/useKeyboardShortcuts.ts
// Global keyboard shortcuts management
// Handles Cmd+K command palette and other global shortcuts

import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
  onCommandPalette?: () => void;
  onQuickAdd?: () => void;
  onFocusMode?: () => void;
  onSearch?: () => void;
  onSettings?: () => void;
}

const useKeyboardShortcuts = ({
  onCommandPalette,
  onQuickAdd,
  onFocusMode,
  onSearch,
  onSettings
}: KeyboardShortcuts) => {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, metaKey, ctrlKey, shiftKey, altKey } = event;
    const isModifierPressed = metaKey || ctrlKey;
    
    // Ignore shortcuts when user is typing in inputs
    const target = event.target as HTMLElement;
    const isTyping = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.contentEditable === 'true';
    
    // Command Palette: Cmd+K or Ctrl+K
    if (isModifierPressed && key === 'k' && !shiftKey && !altKey) {
      event.preventDefault();
      onCommandPalette?.();
      return;
    }
    
    // Skip other shortcuts if user is typing
    if (isTyping) return;
    
    // Quick Add: Cmd+N or Ctrl+N
    if (isModifierPressed && key === 'n' && !shiftKey && !altKey) {
      event.preventDefault();
      onQuickAdd?.();
      return;
    }
    
    // Focus Mode: Cmd+F or Ctrl+F (if not in input)
    if (isModifierPressed && key === 'f' && !shiftKey && !altKey) {
      event.preventDefault();
      onFocusMode?.();
      return;
    }
    
    // Search: Cmd+/ or Ctrl+/
    if (isModifierPressed && key === '/') {
      event.preventDefault();
      onSearch?.();
      return;
    }
    
    // Settings: Cmd+, or Ctrl+,
    if (isModifierPressed && key === ',') {
      event.preventDefault();
      onSettings?.();
      return;
    }
    
    // Quick navigation with just keys (when not typing)
    switch (key) {
      case '?':
        // Show help/shortcuts
        if (!isModifierPressed) {
          event.preventDefault();
          console.log('Show keyboard shortcuts help');
        }
        break;
        
      case 'Escape':
        // General escape - could close modals, clear focus, etc.
        // This would be handled by individual components
        break;
    }
    
  }, [onCommandPalette, onQuickAdd, onFocusMode, onSearch, onSettings]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Return available shortcuts for display
  const shortcuts = {
    commandPalette: { key: '⌘K', description: 'Open command palette' },
    quickAdd: { key: '⌘N', description: 'Quick add event' },
    focusMode: { key: '⌘F', description: 'Enter focus mode' },
    search: { key: '⌘/', description: 'Search' },
    settings: { key: '⌘,', description: 'Open settings' },
    help: { key: '?', description: 'Show help' }
  };

  return shortcuts;
};

export default useKeyboardShortcuts;