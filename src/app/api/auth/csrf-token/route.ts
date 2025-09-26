/**
 * CSRF Token API Endpoint
 * @fileoverview API endpoint for generating CSRF tokens
 * @compliance CSRF protection with secure token generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { CSRFProtection } from '@/lib/security/csrf/csrf-protection';

export async function GET(request: NextRequest) {
  try {
    // Generate a new CSRF token
    const token = await CSRFProtection.generateToken();
    
    // Set the token in a secure HTTP-only cookie
    const response = NextResponse.json({ 
      token,
      timestamp: new Date().toISOString()
    });

    // Set CSRF token cookie
    response.cookies.set('csrf-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    });

    return response;

  } catch (error) {
    console.error('CSRF token generation failed:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
