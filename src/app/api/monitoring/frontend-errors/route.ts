/**
 * Frontend Errors API Endpoint
 * @fileoverview API endpoint for receiving frontend error reports
 * @compliance Error monitoring with privacy compliance
 */

import { NextRequest, NextResponse } from 'next/server';
import { logSecurityEvent } from '@/lib/security/logging/security-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { errors, sessionId, userId } = body;

    if (!errors || !Array.isArray(errors)) {
      return NextResponse.json(
        { error: 'Invalid error data format' },
        { status: 400 }
      );
    }

    // Log each error using console for now
    for (const error of errors) {
      console.log('🚨 Frontend Error:', {
        message: error.message,
        errorType: error.errorType,
        severity: error.severity,
        url: error.url,
        lineNumber: error.lineNumber,
        columnNumber: error.columnNumber,
        sessionId: error.sessionId || sessionId,
        userId: error.userId || userId,
        userAgent: error.userAgent,
        timestamp: error.timestamp,
        context: error.context
      });
    }

    // In production, you might want to send these to an external service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with Sentry or similar service
      console.log(`📊 Frontend Errors Report: ${errors.length} errors from session ${sessionId}`);
    }

    return NextResponse.json({ 
      success: true, 
      received: errors.length,
      sessionId 
    });

  } catch (error) {
    console.error('Frontend error endpoint failed:', error);

    return NextResponse.json(
      { error: 'Failed to process error report' },
      { status: 500 }
    );
  }
}
