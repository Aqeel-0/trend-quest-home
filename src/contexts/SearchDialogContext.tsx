import { createContext, useContext, useState, type ReactNode } from "react";

interface SearchDialogContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const SearchDialogContext = createContext<SearchDialogContextValue | null>(null);

export function SearchDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SearchDialogContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((v) => !v),
      }}
    >
      {children}
    </SearchDialogContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSearchDialog() {
  const ctx = useContext(SearchDialogContext);
  if (!ctx) throw new Error("useSearchDialog must be used within SearchDialogProvider");
  return ctx;
}
