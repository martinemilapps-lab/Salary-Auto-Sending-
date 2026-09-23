'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Direction, Translations } from './types';
import { ar } from './ar';
import { en } from './en';

interface I18nContextType {
  language: Language;
  direction: Direction;
  t: Translations;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default language is Arabic as specified in requirements
  const [language, setLanguageState] = useState<Language>('ar');

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';
  const t = language === 'ar' ? ar : en;

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hr_salary_lang', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  useEffect(() => {
    const saved = localStorage.getItem('hr_salary_lang') as Language | null;
    const initialLang = saved === 'en' ? 'en' : 'ar';
    setLanguageState(initialLang);
    document.documentElement.lang = initialLang;
    document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
  }, []);

  return (
    <I18nContext.Provider value={{ language, direction, t, setLanguage, toggleLanguage }}>
      <div dir={direction} className={direction === 'rtl' ? 'font-arabic' : ''}>
        {children}
      </div>
    </I18nContext.Provider>
  );
};

export function useTranslation(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
