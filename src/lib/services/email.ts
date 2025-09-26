/**
 * Email Service
 * 
 * Handles email notifications for pharmacy registration and verification
 */

interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendVerificationEmail(
  email: string,
  entityType: 'pharmacy' | 'doctor' | 'clinic' | 'laboratory',
  entityId: string
): Promise<void> {
  const subject = getVerificationEmailSubject(entityType)
  const { html, text } = getVerificationEmailContent(entityType, entityId)

  await sendEmail({
    to: email,
    subject,
    html,
    text
  })
}

export async function sendWelcomeEmail(
  email: string,
  entityType: 'pharmacy' | 'doctor' | 'clinic' | 'laboratory',
  entityName: string
): Promise<void> {
  const subject = getWelcomeEmailSubject(entityType)
  const { html, text } = getWelcomeEmailContent(entityType, entityName)

  await sendEmail({
    to: email,
    subject,
    html,
    text
  })
}

export async function sendRejectionEmail(
  email: string,
  entityType: 'pharmacy' | 'doctor' | 'clinic' | 'laboratory',
  entityName: string,
  reason: string
): Promise<void> {
  const subject = getRejectionEmailSubject(entityType)
  const { html, text } = getRejectionEmailContent(entityType, entityName, reason)

  await sendEmail({
    to: email,
    subject,
    html,
    text
  })
}

async function sendEmail(data: EmailData): Promise<void> {
  try {
    // Here you would integrate with your email service provider
    // For example: SendGrid, Resend, AWS SES, etc.
    console.log('Sending email:', data)
    
    // Example with fetch to an email API endpoint
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}

function getVerificationEmailSubject(entityType: string): string {
  const entityNames = {
    pharmacy: 'farmacia',
    doctor: 'médico',
    clinic: 'clínica',
    laboratory: 'laboratorio'
  }

  return `Red-Salud: Verificación de registro de ${entityNames[entityType as keyof typeof entityNames]}`
}

function getVerificationEmailContent(entityType: string, entityId: string): { html: string; text: string } {
  const entityNames = {
    pharmacy: 'farmacia',
    doctor: 'médico', 
    clinic: 'clínica',
    laboratory: 'laboratorio'
  }

  const entityName = entityNames[entityType as keyof typeof entityNames]

  const text = `
    ¡Gracias por registrar tu ${entityName} en Red-Salud!

    Hemos recibido tu solicitud de registro y nuestro equipo la está revisando.

    Estado actual: En revisión
    Tiempo estimado: 1-3 días hábiles
    ID de referencia: ${entityId}

    Te notificaremos por email cuando la verificación esté completa.

    Si tienes preguntas, contacta nuestro soporte:
    - Email: soporte@red-salud.com
    - Teléfono: +52 (55) 1234-5678

    Gracias por elegir Red-Salud.

    El equipo de Red-Salud
  `

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Verificación de Registro - Red-Salud</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #e74c3c;">Red-Salud</h1>
                <h2 style="color: #34495e;">Verificación de Registro</h2>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin-top: 0;">¡Gracias por registrar tu ${entityName}!</h3>
                <p>Hemos recibido tu solicitud de registro y nuestro equipo la está revisando cuidadosamente.</p>
            </div>

            <div style="background: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #2c3e50; margin-top: 0;">Estado de tu solicitud:</h4>
                <ul style="list-style: none; padding: 0;">
                    <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                        <strong>Estado:</strong> 
                        <span style="color: #f39c12; font-weight: bold;">En revisión</span>
                    </li>
                    <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                        <strong>Tiempo estimado:</strong> 1-3 días hábiles
                    </li>
                    <li style="padding: 8px 0;">
                        <strong>ID de referencia:</strong> ${entityId}
                    </li>
                </ul>
            </div>

            <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #27ae60;">
                    <strong>✓ Próximos pasos:</strong><br>
                    Te notificaremos por email cuando la verificación esté completa y tu cuenta esté activa.
                </p>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h4 style="color: #2c3e50; margin-top: 0;">¿Necesitas ayuda?</h4>
                <p>Si tienes preguntas sobre tu registro, nuestro equipo de soporte está aquí para ayudarte:</p>
                <ul>
                    <li><strong>Email:</strong> soporte@red-salud.com</li>
                    <li><strong>Teléfono:</strong> +52 (55) 1234-5678</li>
                    <li><strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM (CDT)</li>
                </ul>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="color: #7f8c8d; font-size: 14px;">
                    Gracias por elegir Red-Salud<br>
                    <strong>El equipo de Red-Salud</strong>
                </p>
            </div>
        </div>
    </body>
    </html>
  `

  return { html, text }
}

function getWelcomeEmailSubject(entityType: string): string {
  const entityNames = {
    pharmacy: 'farmacia',
    doctor: 'médico',
    clinic: 'clínica', 
    laboratory: 'laboratorio'
  }

  return `¡Bienvenido a Red-Salud! Tu ${entityNames[entityType as keyof typeof entityNames]} ha sido verificada`
}

function getWelcomeEmailContent(entityType: string, entityName: string): { html: string; text: string } {
  const text = `
    ¡Felicidades ${entityName}!

    Tu ${entityType} ha sido verificada exitosamente y ahora forma parte de la red Red-Salud.

    Ya puedes:
    - Acceder a tu dashboard personalizado
    - Gestionar tu perfil y servicios
    - Conectar con pacientes y otros profesionales
    - Utilizar todas las herramientas de la plataforma

    Inicia sesión en: https://red-salud.com/login

    ¡Bienvenido a la familia Red-Salud!

    El equipo de Red-Salud
  `

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>¡Bienvenido a Red-Salud!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #27ae60;">¡Bienvenido a Red-Salud!</h1>
                <h2 style="color: #34495e;">Verificación Completa</h2>
            </div>

            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <h3 style="color: #27ae60; margin-top: 0;">¡Felicidades ${entityName}!</h3>
                <p style="font-size: 18px; margin-bottom: 0;">
                    Tu ${entityType} ha sido verificada exitosamente y ahora forma parte de la red Red-Salud.
                </p>
            </div>

            <div style="background: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #2c3e50; margin-top: 0;">Ya puedes disfrutar de:</h4>
                <ul style="color: #555;">
                    <li style="margin-bottom: 8px;">✓ Acceder a tu dashboard personalizado</li>
                    <li style="margin-bottom: 8px;">✓ Gestionar tu perfil y servicios</li>
                    <li style="margin-bottom: 8px;">✓ Conectar con pacientes y otros profesionales</li>
                    <li style="margin-bottom: 8px;">✓ Utilizar todas las herramientas de la plataforma</li>
                </ul>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
                <a href="https://red-salud.com/login" 
                   style="display: inline-block; background: #27ae60; color: white; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold;">
                    Acceder a Mi Dashboard
                </a>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="color: #7f8c8d; font-size: 14px;">
                    ¡Bienvenido a la familia Red-Salud!<br>
                    <strong>El equipo de Red-Salud</strong>
                </p>
            </div>
        </div>
    </body>
    </html>
  `

  return { html, text }
}

function getRejectionEmailSubject(entityType: string): string {
  const entityNames = {
    pharmacy: 'farmacia',
    doctor: 'médico',
    clinic: 'clínica',
    laboratory: 'laboratorio'
  }

  return `Red-Salud: Solicitud de registro de ${entityNames[entityType as keyof typeof entityNames]} requiere atención`
}

function getRejectionEmailContent(entityType: string, entityName: string, reason: string): { html: string; text: string } {
  const text = `
    Estimado ${entityName},

    Hemos revisado tu solicitud de registro para ${entityType} en Red-Salud.

    Desafortunadamente, necesitamos información adicional antes de poder aprobar tu registro.

    Motivo: ${reason}

    Para continuar con el proceso:
    1. Revisa los documentos y la información enviada
    2. Realiza las correcciones necesarias
    3. Envía la información actualizada

    Puedes actualizar tu información en: https://red-salud.com/auth/register/${entityType}

    Si tienes preguntas, contacta nuestro soporte:
    - Email: soporte@red-salud.com
    - Teléfono: +52 (55) 1234-5678

    Estamos aquí para ayudarte a completar tu registro.

    El equipo de Red-Salud
  `

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Solicitud de Registro - Red-Salud</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #e74c3c;">Red-Salud</h1>
                <h2 style="color: #34495e;">Solicitud de Registro</h2>
            </div>

            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                <h3 style="color: #856404; margin-top: 0;">Estimado ${entityName},</h3>
                <p>Hemos revisado tu solicitud de registro para ${entityType} en Red-Salud.</p>
                <p><strong>Necesitamos información adicional antes de poder aprobar tu registro.</strong></p>
            </div>

            <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
                <h4 style="color: #721c24; margin-top: 0;">Motivo:</h4>
                <p style="color: #721c24; margin-bottom: 0;">${reason}</p>
            </div>

            <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #17a2b8;">
                <h4 style="color: #0c5460; margin-top: 0;">Para continuar con el proceso:</h4>
                <ol style="color: #0c5460;">
                    <li>Revisa los documentos y la información enviada</li>
                    <li>Realiza las correcciones necesarias</li>
                    <li>Envía la información actualizada</li>
                </ol>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
                <a href="https://red-salud.com/auth/register/${entityType}" 
                   style="display: inline-block; background: #17a2b8; color: white; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold;">
                    Actualizar Mi Información
                </a>
            </div>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h4 style="color: #2c3e50; margin-top: 0;">¿Necesitas ayuda?</h4>
                <p>Si tienes preguntas sobre los requisitos o el proceso, nuestro equipo de soporte está aquí para ayudarte:</p>
                <ul>
                    <li><strong>Email:</strong> soporte@red-salud.com</li>
                    <li><strong>Teléfono:</strong> +52 (55) 1234-5678</li>
                    <li><strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM (CDT)</li>
                </ul>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="color: #7f8c8d; font-size: 14px;">
                    Estamos aquí para ayudarte a completar tu registro<br>
                    <strong>El equipo de Red-Salud</strong>
                </p>
            </div>
        </div>
    </body>
    </html>
  `

  return { html, text }
}
