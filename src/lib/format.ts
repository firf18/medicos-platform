import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatea una fecha ISO a un formato legible en español
 * @param isoDate - Fecha en formato ISO
 * @param formatStr - Formato de salida (por defecto 'PPP')
 * @returns Fecha formateada
 */
export function formatDate(isoDate: string, formatStr = 'PPP'): string {
  try {
    return format(parseISO(isoDate), formatStr, { locale: es })
  } catch (error) {
    console.error('Error formatting date:', error)
    return isoDate
  }
}

/**
 * Formatea un número como moneda
 * @param amount - Cantidad a formatear
 * @param currency - Código de moneda (por defecto 'EUR')
 * @returns Cantidad formateada como moneda
 */
export function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Trunca un texto a una longitud específica
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima
 * @returns Texto truncado con puntos suspensivos
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Capitaliza la primera letra de un string
 * @param str - String a capitalizar
 * @returns String con la primera letra en mayúscula
 */
export function capitalizeFirst(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}