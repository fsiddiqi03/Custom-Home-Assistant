"use client";

/**
 * Edit Mode context provider
 * Manages edit mode state for drag and drop functionality
 */

import { createContext, useContext, useState, useCallback } from "react";

interface EditModeContextValue {
  isEditMode: boolean;
  toggleEditMode: () => void;
  setEditMode: (value: boolean) => void;
}

const EditModeContext = createContext<EditModeContextValue | null>(null);

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  const setEditMode = useCallback((value: boolean) => {
    setIsEditMode(value);
  }, []);

  return (
    <EditModeContext.Provider value={{ isEditMode, toggleEditMode, setEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error("useEditMode must be used within an EditModeProvider");
  }
  return context;
}
