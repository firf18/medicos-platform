'use client';

import { User, Calendar, FileText, Building, TestTube, Clock, Phone, Mail, MapPin, Star } from 'lucide-react';
import Link from 'next/link';

export interface SearchResult {
  id: string;
  type: 'patient' | 'doctor' | 'appointment' | 'lab_result' | 'clinic';
  title: string;
  subtitle?: string;
  description?: string;
  metadata: {
    [key: string]: any;
  };
  url: string;
  highlighted?: string[];
  badge?: {
    text: string;
    color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  };
  urgency?: 'high' | 'medium' | 'low';
}

interface SearchResultsListProps {
  results: SearchResult[];
  loading?: boolean;
  query?: string;
  onResultClick?: (result: SearchResult) => void;
  groupByType?: boolean;
  emptyMessage?: string;
}

export default function SearchResultsList({
  results,
  loading = false,
  query,
  onResultClick,
  groupByType = false,
  emptyMessage = "No se encontraron resultados"
}: SearchResultsListProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'patient': return <User className="h-5 w-5 text-blue-600" />;
      case 'doctor': return <Building className="h-5 w-5 text-green-600" />;
      case 'appointment': return <Calendar className="h-5 w-5 text-purple-600" />;
      case 'lab_result': return <TestTube className="h-5 w-5 text-orange-600" />;
      case 'clinic': return <Building className="h-5 w-5 text-gray-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-800';
      case 'green': return 'bg-green-100 text-green-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      case 'red': return 'bg-red-100 text-red-800';
      case 'purple': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-transparent';
    }
  };

  const highlightText = (text: string, highlights: string[] = []) => {
    if (!highlights.length || !query) return text;
    
    let highlightedText = text;
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  const formatMetadata = (result: SearchResult) => {
    const items = [];
    
    if (result.metadata.date) {
      items.push(
        <div key="date" className="flex items-center text-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          {new Date(result.metadata.date).toLocaleDateString()}
        </div>
      );
    }
    
    if (result.metadata.phone) {
      items.push(
        <div key="phone" className="flex items-center text-gray-500">
          <Phone className="h-3 w-3 mr-1" />
          {result.metadata.phone}
        </div>
      );
    }
    
    if (result.metadata.email) {
      items.push(
        <div key="email" className="flex items-center text-gray-500">
          <Mail className="h-3 w-3 mr-1" />
          {result.metadata.email}
        </div>
      );
    }
    
    if (result.metadata.location) {
      items.push(
        <div key="location" className="flex items-center text-gray-500">
          <MapPin className="h-3 w-3 mr-1" />
          {result.metadata.location}
        </div>
      );
    }
    
    if (result.metadata.rating) {
      items.push(
        <div key="rating" className="flex items-center text-gray-500">
          <Star className="h-3 w-3 mr-1" />
          {result.metadata.rating}/5
        </div>
      );
    }

    return items;
  };

  const groupedResults = groupByType 
    ? results.reduce((groups, result) => {
        const type = result.type;
        if (!groups[type]) groups[type] = [];
        groups[type].push(result);
        return groups;
      }, {} as Record<string, SearchResult[]>)
    : { all: results };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'patient': return 'Pacientes';
      case 'doctor': return 'Médicos';
      case 'appointment': return 'Citas';
      case 'lab_result': return 'Resultados de Laboratorio';
      case 'clinic': return 'Clínicas';
      default: return 'Otros';
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyMessage}</h3>
        {query && (
          <p className="mt-1 text-sm text-gray-500">
            No encontramos resultados para &ldquo;<strong>{query}</strong>&rdquo;
          </p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          Intenta con diferentes términos de búsqueda o ajusta los filtros.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Resultados de búsqueda ({results.length})
        </h3>
        {query && (
          <p className="text-sm text-gray-600">
            Resultados para &ldquo;<strong>{query}</strong>&rdquo;
          </p>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {Object.entries(groupedResults).map(([groupType, groupResults]) => (
          <div key={groupType}>
            {groupByType && groupType !== 'all' && (
              <div className="px-6 py-3 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                  {getIcon(groupType)}
                  <span className="ml-2">{getTypeLabel(groupType)} ({groupResults.length})</span>
                </h4>
              </div>
            )}
            
            {groupResults.map((result) => (
              <Link
                key={result.id}
                href={result.url}
                onClick={() => onResultClick?.(result)}
                className={`block hover:bg-gray-50 transition-colors ${getUrgencyColor(result.urgency)} border-l-4`}
              >
                <div className="px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {getIcon(result.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {highlightText(result.title, result.highlighted)}
                        </h4>
                        {result.badge && (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeColor(result.badge.color)}`}>
                            {result.badge.text}
                          </span>
                        )}
                        {result.urgency === 'high' && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Urgente
                          </span>
                        )}
                      </div>
                      
                      {result.subtitle && (
                        <p className="text-sm text-gray-600 truncate">
                          {highlightText(result.subtitle, result.highlighted)}
                        </p>
                      )}
                      
                      {result.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {highlightText(result.description, result.highlighted)}
                        </p>
                      )}
                      
                      {/* Metadata */}
                      <div className="flex items-center space-x-4 mt-2 text-xs">
                        {formatMetadata(result)}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
