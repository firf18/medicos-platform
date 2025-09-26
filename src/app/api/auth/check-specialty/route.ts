/**
 * API Endpoint: Check Medical Specialty Validation
 * @fileoverview Endpoint for validating medical specialties and sub-specialties
 * @compliance HIPAA-compliant specialty validation API
 */

import { NextRequest, NextResponse } from 'next/server';
import { MedicalSpecialtyValidationService } from '@/lib/medical-validations/specialty/medical-specialty-validation.service';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';
import { RateLimiter } from '@/lib/security/rate-limiting/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await RateLimiter.checkLimit(request, {
      maxRequests: 10,
      windowMs: 60000, // 1 minute
      keyGenerator: (req) => `specialty:${req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'}`
    });
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter 
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { 
      specialtyId, 
      subSpecialties, 
      workingHours, 
      doctorCredentials,
      validationType = 'comprehensive' 
    } = body;

    // Validate required fields
    if (!specialtyId) {
      return NextResponse.json(
        { error: 'specialtyId is required' },
        { status: 400 }
      );
    }

    let result;

    switch (validationType) {
      case 'basic':
        result = await MedicalSpecialtyValidationService.validateSpecialty(
          specialtyId,
          subSpecialties?.[0], // First sub-specialty for basic validation
          doctorCredentials
        );
        break;

      case 'sub_specialties':
        result = MedicalSpecialtyValidationService.validateSubSpecialties(
          specialtyId,
          subSpecialties || []
        );
        break;

      case 'schedules':
        if (!workingHours) {
          return NextResponse.json(
            { error: 'workingHours is required for schedule validation' },
            { status: 400 }
          );
        }
        result = MedicalSpecialtyValidationService.validateMedicalSchedules(
          specialtyId,
          workingHours
        );
        break;

      case 'availability':
        result = await MedicalSpecialtyValidationService.checkSpecialtyAvailability(specialtyId);
        break;

      case 'comprehensive':
      default:
        // Run all validations
        const specialtyValidation = await MedicalSpecialtyValidationService.validateSpecialty(
          specialtyId,
          subSpecialties?.[0],
          doctorCredentials
        );

        const subSpecialtyValidation = subSpecialties ? 
          MedicalSpecialtyValidationService.validateSubSpecialties(specialtyId, subSpecialties) : 
          null;

        const scheduleValidation = workingHours ? 
          MedicalSpecialtyValidationService.validateMedicalSchedules(specialtyId, workingHours) : 
          null;

        const availabilityCheck = await MedicalSpecialtyValidationService.checkSpecialtyAvailability(specialtyId);

        result = {
          specialty: specialtyValidation,
          subSpecialties: subSpecialtyValidation,
          schedules: scheduleValidation,
          availability: availabilityCheck,
          overallValid: specialtyValidation.isValid && 
                        (!subSpecialtyValidation || subSpecialtyValidation.valid) &&
                        (!scheduleValidation || scheduleValidation.isValid) &&
                        availabilityCheck.available
        };
        break;
    }

    // Log successful validation
    await logSecurityEvent(
      'data_access',
      'specialty_validation_completed',
      {
        specialtyId,
        validationType,
        isValid: result.isValid || result.overallValid || result.valid,
        timestamp: new Date().toISOString()
      },
      'info'
    );

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Log error
    await logSecurityEvent(
      'data_access',
      'specialty_validation_error',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      'error'
    );

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await RateLimiter.checkLimit(request, {
      maxRequests: 10,
      windowMs: 60000,
      keyGenerator: (req) => `specialty_info:${req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'}`
    });
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter 
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'list':
        const specialties = MedicalSpecialtyValidationService.getAllSpecialties();
        return NextResponse.json({
          success: true,
          data: specialties,
          count: specialties.length
        });

      case 'categories':
        const categories = MedicalSpecialtyValidationService.getSpecialtiesByCategory(
          searchParams.get('category') as any
        );
        return NextResponse.json({
          success: true,
          data: categories,
          count: categories.length
        });

      case 'search':
        const query = searchParams.get('q');
        if (!query) {
          return NextResponse.json(
            { error: 'Query parameter q is required' },
            { status: 400 }
          );
        }
        const searchResults = MedicalSpecialtyValidationService.searchSpecialties(query);
        return NextResponse.json({
          success: true,
          data: searchResults,
          count: searchResults.length,
          query
        });

      case 'status':
        const status = MedicalSpecialtyValidationService.getStatus();
        return NextResponse.json({
          success: true,
          data: status
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: list, categories, search, or status' },
          { status: 400 }
        );
    }

  } catch (error) {
    await logSecurityEvent(
      'data_access',
      'specialty_info_error',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      'error'
    );

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
