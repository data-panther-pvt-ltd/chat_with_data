"use client";

import { useLanguage } from "./LanguageProvider";

export function Header() {
  const { language, toggleLanguage, isRTL } = useLanguage();
  const t = (key: string) => {
    const dict = language === "ar" ? ar : en;
    return (dict as any)[key] || key;
  };
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
            title={language === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
          >
            {language === "en" ? "العربية" : "English"}
          </button>
        </div>
      </div>
    </header>
  );
} 

const en = {
  title: "Data Dashboard",
  subtitle: "Interactive data visualization with AI assistance",
};

const ar = {
  title: "لوحة البيانات",
  subtitle: "تصوّر بيانات تفاعلي بمساعدة الذكاء الاصطناعي",
};