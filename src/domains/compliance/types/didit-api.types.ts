/**
 * Didit API Types
 * @fileoverview Types for Didit identity verification API integration
 * @compliance HIPAA-compliant API data structures
 */

import { z } from 'zod';

// Session response schema
export const DiditSessionSchema = z.object({
  session_id: z.string().uuid(),
  session_number: z.number(),
  session_token: z.string(),
  vendor_data: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.enum(['Not Started', 'In Progress', 'Approved', 'Declined', 'In Review', 'Abandoned']),
  workflow_id: z.string().uuid(),
  callback: z.string().url().optional(),
  url: z.string().url(),
  created_at: z.string()
});

// Decision/verification results schema
export const DiditDecisionSchema = z.object({
  session_id: z.string().uuid(),
  session_number: z.number(),
  session_url: z.string().url(),
  status: z.enum(['Not Started', 'In Progress', 'Approved', 'Declined', 'In Review', 'Abandoned']),
  workflow_id: z.string().uuid(),
  features: z.array(z.string()),
  vendor_data: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  expected_details: z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional()
  }).optional(),
  contact_details: z.object({
    email: z.string().email(),
    email_lang: z.string().optional()
  }).optional(),
  callback: z.string().url().optional(),
  
  // ID Verification
  id_verification: z.object({
    status: z.enum(['Approved', 'Declined', 'In Review']),
    document_type: z.string().optional(),
    document_number: z.string().optional(),
    personal_number: z.string().optional(),
    portrait_image: z.string().url().optional(),
    front_image: z.string().url().optional(),
    back_image: z.string().url().optional(),
    date_of_birth: z.string().optional(),
    age: z.number().optional(),
    expiration_date: z.string().optional(),
    date_of_issue: z.string().optional(),
    issuing_state: z.string().optional(),
    issuing_state_name: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    full_name: z.string().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    formatted_address: z.string().optional(),
    place_of_birth: z.string().optional(),
    nationality: z.string().optional(),
    warnings: z.array(z.object({
      risk: z.string(),
      additional_data: z.any().optional(),
      log_type: z.string(),
      short_description: z.string(),
      long_description: z.string()
    })).optional()
  }).optional(),
  
  // Face Match
  face_match: z.object({
    status: z.enum(['match', 'no_match', 'pending']),
    confidence: z.number().min(0).max(100).optional(),
    similarity: z.number().min(0).max(100).optional()
  }).optional(),
  
  // Liveness
  liveness: z.object({
    status: z.enum(['live', 'not_live', 'pending']),
    confidence: z.number().min(0).max(100).optional()
  }).optional(),
  
  // AML Screening
  aml: z.object({
    status: z.enum(['clear', 'hit', 'pending']),
    risk_level: z.enum(['low', 'medium', 'high']).optional(),
    matches: z.array(z.any()).optional()
  }).optional(),
  
  // Reviews
  reviews: z.array(z.object({
    review_id: z.string(),
    status: z.enum(['approved', 'declined']),
    reviewer: z.string(),
    timestamp: z.string()
  })).optional(),
  
  verification_result: z.record(z.string(), z.any()).optional(),
  decision: z.enum(['approved', 'declined', 'review', 'error', 'abandoned']),
  decline_reason: z.string().optional()
});

// Venezuelan doctor data schema
export const VenezuelanDoctorDataSchema = z.object({
  // Datos personales
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  
  // Documento venezolano (Cédula de Identidad)
  documentType: z.enum(['V', 'E']).default('V'), // V = Venezolano, E = Extranjero
  documentNumber: z.string()
    .regex(/^\d{7,8}$/, 'El número de cédula debe tener 7 u 8 dígitos'),
  
  // Correo electrónico
  email: z.string().email(),
  
  // Datos profesionales médicos
  licenseNumber: z.string()
    .regex(/^\d{4,8}$/, 'El número de matrícula médica debe tener entre 4 y 8 dígitos'),
  
  // Colegio médico
  medicalBoard: z.enum([
    'Colegio de Médicos del Distrito Metropolitano de Caracas',
    'Colegio de Médicos del Estado Miranda',
    'Colegio de Médicos del Estado Zulia',
    'Colegio de Médicos del Estado Carabobo',
    'Colegio de Médicos del Estado Aragua',
    'Colegio de Médicos del Estado Lara',
    'Colegio de Médicos del Estado Anzoátegui',
    'Colegio de Médicos del Estado Bolívar',
    'Colegio de Médicos del Estado Táchira',
    'Colegio de Médicos del Estado Mérida',
    'Otros'
  ]).optional(),
  
  // Universidad venezolana
  university: z.string().optional(),
  
  // Año de graduación
  graduationYear: z.number()
    .min(1950)
    .max(new Date().getFullYear())
    .optional()
});

// Type exports
export type DiditSession = z.infer<typeof DiditSessionSchema>;
export type DiditDecision = z.infer<typeof DiditDecisionSchema>;
export type VenezuelanDoctorData = z.infer<typeof VenezuelanDoctorDataSchema>;

// Status enums
export const DIDIT_STATUS = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  APPROVED: 'Approved',
  DECLINED: 'Declined',
  IN_REVIEW: 'In Review',
  ABANDONED: 'Abandoned'
} as const;

export const DECISION_STATUS = {
  APPROVED: 'approved',
  DECLINED: 'declined',
  REVIEW: 'review',
  ERROR: 'error',
  ABANDONED: 'abandoned'
} as const;

// Configuration types
export interface DiditConfig {
  environment: 'sandbox' | 'production';
  workflowId: string;
  apiKey: string;
  apiSecret: string;
  callbackUrl?: string;
  webhookUrl?: string;
  features?: string[];
}

// Error types
export interface DiditError {
  code: string;
  message: string;
  details?: Record<string, any>;
  statusCode?: number;
}

// Webhook payload type
export interface DiditWebhookPayload {
  event: 'session.completed' | 'session.updated' | 'session.expired';
  timestamp: string;
  data: DiditDecision;
  signature: string;
}
