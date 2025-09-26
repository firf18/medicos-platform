/**
 * Pharmacy Search API Endpoint
 * 
 * Provides search and filtering capabilities for pharmacies
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parámetros de búsqueda
    const query = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';
    const state = searchParams.get('state') || '';
    const services = searchParams.get('services')?.split(',') || [];
    const isOpen = searchParams.get('is_open') === 'true';
    const sortBy = searchParams.get('sort_by') || 'name'; // name, rating, distance
    const sortOrder = searchParams.get('sort_order') || 'asc'; // asc, desc
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Max 50 results
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');

    const supabase = createRouteHandlerClient({ cookies });

    // Construir query base
    let queryBuilder = supabase
      .from('pharmacies')
      .select(`
        id,
        pharmacy_name,
        commercial_name,
        email,
        phone,
        address,
        city,
        state,
        postal_code,
        business_hours,
        services,
        specialties,
        verification_status,
        is_verified,
        is_active,
        created_at,
        pharmacy_services!inner (
          id,
          service_name,
          service_type,
          price,
          is_available
        ),
        pharmacy_reviews!left (
          rating
        )
      `)
      .eq('is_active', true)
      .eq('is_verified', true);

    // Filtrar por texto de búsqueda
    if (query) {
      queryBuilder = queryBuilder.or(
        `pharmacy_name.ilike.%${query}%,commercial_name.ilike.%${query}%,address.ilike.%${query}%`
      );
    }

    // Filtrar por ciudad
    if (city) {
      queryBuilder = queryBuilder.ilike('city', `%${city}%`);
    }

    // Filtrar por estado
    if (state) {
      queryBuilder = queryBuilder.eq('state', state);
    }

    // Filtrar por servicios
    if (services.length > 0) {
      queryBuilder = queryBuilder.overlaps('services', services);
    }

    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder = queryBuilder.range(offset, offset + limit - 1);

    // Ejecutar query
    const { data: pharmacies, error: pharmaciesError, count } = await queryBuilder;

    if (pharmaciesError) {
      console.error('Search pharmacies error:', pharmaciesError);
      return NextResponse.json(
        { error: 'Error buscando farmacias' },
        { status: 500 }
      );
    }

    // Procesar resultados
    const processedPharmacies = pharmacies?.map(pharmacy => {
      // Calcular rating promedio
      const reviews = pharmacy.pharmacy_reviews || [];
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
        : 0;

      // Verificar si está abierto ahora (si se solicita)
      let isCurrentlyOpen = null;
      if (isOpen) {
        const now = new Date();
        const currentDay = now.toLocaleLowerCase().substring(0, 3); // mon, tue, etc.
        const currentTime = now.toTimeString().substring(0, 5); // HH:MM
        
        const businessHours = pharmacy.business_hours as any;
        const todayHours = businessHours[currentDay + 'day']; // monday, tuesday, etc.
        
        if (todayHours && todayHours.isOpen) {
          isCurrentlyOpen = currentTime >= todayHours.open && currentTime <= todayHours.close;
        } else {
          isCurrentlyOpen = false;
        }
      }

      // Calcular distancia si se proporcionan coordenadas
      let distance = null;
      if (lat && lng) {
        // Aquí podrías usar una función de cálculo de distancia
        // Por ahora, simularemos una distancia aleatoria
        distance = Math.random() * 10; // km
      }

      return {
        id: pharmacy.id,
        pharmacy_name: pharmacy.pharmacy_name,
        commercial_name: pharmacy.commercial_name,
        email: pharmacy.email,
        phone: pharmacy.phone,
        address: pharmacy.address,
        city: pharmacy.city,
        state: pharmacy.state,
        postal_code: pharmacy.postal_code,
        business_hours: pharmacy.business_hours,
        services: pharmacy.services,
        specialties: pharmacy.specialties,
        is_verified: pharmacy.is_verified,
        average_rating: Math.round(averageRating * 10) / 10,
        total_reviews: reviews.length,
        available_services: pharmacy.pharmacy_services?.filter((service: any) => service.is_available) || [],
        is_currently_open: isCurrentlyOpen,
        distance: distance,
        created_at: pharmacy.created_at
      };
    }) || [];

    // Filtrar por horario abierto si se solicita
    let filteredPharmacies = processedPharmacies;
    if (isOpen) {
      filteredPharmacies = processedPharmacies.filter(pharmacy => pharmacy.is_currently_open);
    }

    // Ordenar resultados
    filteredPharmacies.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'rating':
          comparison = b.average_rating - a.average_rating;
          break;
        case 'distance':
          if (a.distance !== null && b.distance !== null) {
            comparison = a.distance - b.distance;
          }
          break;
        case 'name':
        default:
          comparison = a.pharmacy_name.localeCompare(b.pharmacy_name);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Obtener estadísticas adicionales
    const { data: totalCount } = await supabase
      .from('pharmacies')
      .select('id', { count: 'exact' })
      .eq('is_active', true)
      .eq('is_verified', true);

    // Obtener estados únicos para filtros
    const { data: uniqueStates } = await supabase
      .from('pharmacies')
      .select('state')
      .eq('is_active', true)
      .eq('is_verified', true);

    const states = [...new Set(uniqueStates?.map(p => p.state) || [])].sort();

    // Obtener servicios únicos
    const { data: allPharmacies } = await supabase
      .from('pharmacies')
      .select('services')
      .eq('is_active', true)
      .eq('is_verified', true);

    const allServices = new Set<string>();
    allPharmacies?.forEach(pharmacy => {
      if (pharmacy.services) {
        pharmacy.services.forEach((service: string) => allServices.add(service));
      }
    });

    return NextResponse.json({
      pharmacies: filteredPharmacies,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
        has_next: page < Math.ceil((count || 0) / limit),
        has_previous: page > 1
      },
      filters: {
        states,
        services: Array.from(allServices).sort()
      },
      summary: {
        total_pharmacies: totalCount?.length || 0,
        results_shown: filteredPharmacies.length,
        search_query: query,
        filters_applied: {
          city: city || null,
          state: state || null,
          services: services.length > 0 ? services : null,
          is_open: isOpen || null
        }
      }
    });

  } catch (error) {
    console.error('Pharmacy search error:', error);
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
