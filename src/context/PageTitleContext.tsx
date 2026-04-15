import { createContext, useContext, useMemo, useState } from 'react';

interface PageTitleContextValue {
  titleOverride: string | null;
  setTitleOverride: (title: string | null) => void;
}

const PageTitleContext = createContext<PageTitleContextValue | null>(null);

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [titleOverride, setTitleOverride] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      titleOverride,
      setTitleOverride,
    }),
    [titleOverride],
  );

  return <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>;
}

export function usePageTitle() {
  const context = useContext(PageTitleContext);

  if (!context) {
    throw new Error('usePageTitle must be used within a PageTitleProvider');
  }

  return context;
}