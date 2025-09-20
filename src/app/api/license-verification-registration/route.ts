import { NextRequest, NextResponse } from 'next/server';
import { validateVenezuelanMedicalLicense } from '@/lib/validators/professional-license-validator';
import { logger } from '@/lib/logging/logger';

export async function POST(request: NextRequest) {
  try {
    const { documentType, documentNumber, firstName, lastName } = await request.json();
    
    logger.info('verification', 'Starting license verification for registration', {
      documentType,
      documentNumber,
      firstName,
      lastName
    });
    
    const result = await validateVenezuelanMedicalLicense(
      {
        documentType,
        documentNumber
      },
      firstName,
      lastName
    );
    
    logger.info('verification', 'License verification completed', {
      isValid: result.isValid,
      isVerified: result.isVerified,
      doctorName: result.doctorName,
      profession: result.profession,
      specialty: result.specialty
    });
    
    return NextResponse.json({
      success: true,
      result: {
        isValid: result.isValid,
        isVerified: result.isVerified,
        verificationSource: result.verificationSource,
        doctorName: result.doctorName,
        licenseStatus: result.licenseStatus,
        profession: result.profession,
        specialty: result.specialty,
        verificationDate: result.verificationDate,
        analysis: result.analysis
      }
    });

  } catch (error) {
    logger.error('verification', 'Error during license verification', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
