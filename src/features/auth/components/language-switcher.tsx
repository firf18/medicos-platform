'use client';

import { useTranslation } from '@/providers/i18n/hooks/use-translation';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, changeLanguage, getCurrentLanguageName } = useTranslation();
  
  const handleLanguageChange = (newLanguage: 'es' | 'en') => {
    changeLanguage(newLanguage);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>{getCurrentLanguageName()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('es')}
          className="flex items-center justify-between"
        >
          <span>Español</span>
          {language === 'es' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange('en')}
          className="flex items-center justify-between"
        >
          <span>English</span>
          {language === 'en' && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}