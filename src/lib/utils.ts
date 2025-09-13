import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Verifica si un valor no es null ni undefined
 * @param value - Valor a verificar
 * @returns Boolean indicando si el valor existe
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Espera un tiempo determinado
 * @param ms - Milisegundos a esperar
 * @returns Promise que se resuelve después del tiempo especificado
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Copia texto al portapapeles
 * @param text - Texto a copiar
 * @returns Promise con el resultado de la operación
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

/**
 * Genera un ID único
 * @returns String con un ID único
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}