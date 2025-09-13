'use client';

import { useTranslation } from '../hooks/use-translation';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

export function LanguageSelector() {
  const { language, changeLanguage, getLanguageOptions } = useTranslation();
  
  const languageOptions = getLanguageOptions();
  
  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select 
        value={language} 
        onValueChange={(value: 'es' | 'en') => changeLanguage(value)}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languageOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}