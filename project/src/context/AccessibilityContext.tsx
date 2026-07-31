import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
type FontSize = 'sm' | 'md' | 'lg';

interface AccessibilityContextValue {
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  colorblind: ColorblindMode;
  setColorblind: (v: ColorblindMode) => void;
  fontSize: FontSize;
  setFontSize: (v: FontSize) => void;
  audioDescriptions: boolean;
  setAudioDescriptions: (v: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);
  const [colorblind, setColorblind] = useState<ColorblindMode>('none');
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [audioDescriptions, setAudioDescriptions] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('hc-mode', highContrast);
    root.classList.remove('cb-protanopia', 'cb-deuteranopia', 'cb-tritanopia');
    if (colorblind !== 'none') root.classList.add(`cb-${colorblind}`);
    root.classList.remove('font-sm', 'font-md', 'font-lg');
    root.classList.add(`font-${fontSize}`);
  }, [highContrast, colorblind, fontSize]);

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        setHighContrast,
        colorblind,
        setColorblind,
        fontSize,
        setFontSize,
        audioDescriptions,
        setAudioDescriptions,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
}
