'use client';

import { useContext, useMemo } from 'react';
import { I18nContext } from '../I18nProvider';
import esTranslations from '../translations/es.json';
import enTranslations from '../translations/en.json';

// Tipo para las traducciones
type TranslationKeys = 
  | keyof typeof esTranslations
  | `${keyof typeof esTranslations}.${string}`;

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

export function useTranslation() {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  
  const { language, setLanguage } = context;
  
  // Cargar traducciones según el idioma
  const translations = useMemo(() => {
    switch (language) {
      case 'en':
        return enTranslations;
      case 'es':
      default:
        return esTranslations;
    }
  }, [language]);
  
  // Función para obtener traducciones con soporte para claves anidadas
  const t = (key: TranslationKeys, variables?: Record<string, string | number>): string => {
    // Convertir la clave a string por si acaso
    const keyString = String(key);
    
    // Buscar la traducción
    const translation = getNestedValue(translations, keyString);
    
    // Si no se encuentra la traducción, devolver la clave como fallback
    if (translation === undefined) {
      console.warn(`Missing translation for key: ${keyString}`);
      return keyString;
    }
    
    // Formatear el mensaje con variables si se proporcionan
    return formatMessage(translation, variables);
  };
  
  // Función para cambiar el idioma
  const changeLanguage = (newLanguage: 'es' | 'en') => {
    setLanguage(newLanguage);
  };
  
  // Función para obtener el nombre del idioma actual
  const getCurrentLanguageName = (): string => {
    return language === 'en' ? 'English' : 'Español';
  };
  
  // Función para obtener las opciones de idioma
  const getLanguageOptions = (): Array<{ value: 'es' | 'en', label: string }> => {
    return [
      { value: 'es', label: t('common.spanish') },
      { value: 'en', label: t('common.english') }
    ];
  };
  
  return {
    t,
    language,
    changeLanguage,
    getCurrentLanguageName,
    getLanguageOptions
  };
}