'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import esTranslations from './translations/es.json'
import enTranslations from './translations/en.json'

type Language = 'es' | 'en'

interface I18nContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, variables?: Record<string, string | number>) => string
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Función auxiliar para obtener valores anidados de un objeto
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// Función para formatear mensajes con variables
function formatMessage(template: string, variables?: Record<string, string | number>): string {
  if (!variables) return template;
  
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}

// Diccionario de traducciones
const translations = {
  es: esTranslations,
  en: enTranslations
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es')

  // Cargar el idioma preferido del localStorage al iniciar
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language | null
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Guardar el idioma seleccionado en localStorage
  const updateLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('language', newLanguage)
  }

  // Función para obtener la traducción de una clave
  const t = (key: string, variables?: Record<string, string | number>): string => {
    // Buscar la traducción
    const translation = getNestedValue(translations[language], key);
    
    // Si no se encuentra la traducción, devolver la clave como fallback
    if (translation === undefined) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    
    // Formatear el mensaje con variables si se proporcionan
    return formatMessage(translation, variables);
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage: updateLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}