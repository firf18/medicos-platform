'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lightbulb } from 'lucide-react';

interface ValidationSuggestionsProps {
  suggestions: string[];
  isVisible: boolean;
}

export default function ValidationSuggestions({
  suggestions,
  isVisible
}: ValidationSuggestionsProps) {
  if (!isVisible || suggestions.length === 0) return null;

  return (
    <Alert className="mt-2 bg-blue-50 border-blue-200">
      <div className="flex items-start">
        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="ml-2">
          <AlertDescription className="text-blue-800">
            <p className="font-medium text-sm">Sugerencias para mejorar:</p>
            <ul className="mt-1 space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm flex items-start">
                  <span className="mr-2">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
