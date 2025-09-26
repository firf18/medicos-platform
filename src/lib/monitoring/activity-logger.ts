/**
 * Activity Logger
 * 
 * Logs user activities and system events for auditing and monitoring
 */

interface ActivityLog {
  user_id: string
  action: string
  resource_type: string
  resource_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
}

export async function logActivity(activity: ActivityLog): Promise<void> {
  try {
    // Here you would typically send to your logging service
    // For now, we'll log to console and could store in database
    console.log('Activity logged:', {
      ...activity,
      timestamp: new Date().toISOString()
    })

    // You could also send to an analytics service or database
    // await sendToAnalytics(activity)
    // await storeInDatabase(activity)
    
  } catch (error) {
    console.error('Error logging activity:', error)
    // Don't throw error to avoid disrupting main flow
  }
}

export async function logPharmacyRegistration(
  userId: string,
  pharmacyId: string,
  pharmacyName: string,
  details: Record<string, any>
): Promise<void> {
  await logActivity({
    user_id: userId,
    action: 'pharmacy_registration',
    resource_type: 'pharmacy',
    resource_id: pharmacyId,
    details: {
      pharmacy_name: pharmacyName,
      ...details
    }
  })
}

export async function logPharmacyVerification(
  verifierId: string,
  pharmacyId: string,
  status: 'approved' | 'rejected',
  notes?: string
): Promise<void> {
  await logActivity({
    user_id: verifierId,
    action: 'pharmacy_verification',
    resource_type: 'pharmacy',
    resource_id: pharmacyId,
    details: {
      verification_status: status,
      verification_notes: notes,
      verified_at: new Date().toISOString()
    }
  })
}

export async function logPharmacyUpdate(
  userId: string,
  pharmacyId: string,
  updatedFields: string[],
  requiresReverification: boolean
): Promise<void> {
  await logActivity({
    user_id: userId,
    action: 'pharmacy_update',
    resource_type: 'pharmacy',
    resource_id: pharmacyId,
    details: {
      updated_fields: updatedFields,
      requires_reverification: requiresReverification,
      updated_at: new Date().toISOString()
    }
  })
}

export async function logPharmacyLogin(
  userId: string,
  pharmacyId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logActivity({
    user_id: userId,
    action: 'pharmacy_login',
    resource_type: 'pharmacy',
    resource_id: pharmacyId,
    ip_address: ipAddress,
    user_agent: userAgent,
    details: {
      login_timestamp: new Date().toISOString()
    }
  })
}
