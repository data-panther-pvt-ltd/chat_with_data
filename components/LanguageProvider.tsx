"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type SupportedLanguage = "en" | "ar";

type LanguageContextValue = {
  language: SupportedLanguage;
  isRTL: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem("app_language") as SupportedLanguage | null;
    return saved === "ar" ? "ar" : "en";
  });

  const isRTL = language === "ar";

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
      document.documentElement.dir = isRTL ? "rtl" : "ltr";
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("app_language", language);
    }
  }, [language, isRTL]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    isRTL,
    setLanguage,
    toggleLanguage: () => setLanguage((prev) => (prev === "en" ? "ar" : "en")),
  }), [language, isRTL]);

  return (
    <LanguageContext.Provider value={value}>
      <div dir={isRTL ? "rtl" : "ltr"}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}


