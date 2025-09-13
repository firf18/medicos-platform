export type ClassValue = string | number | boolean | undefined | null | ClassValueArray | ClassValueObject;
export type ClassValueArray = ClassValue[];
export type ClassValueObject = { [id: string]: any };

export interface UtilityFunctions {
  cn: (...inputs: ClassValue[]) => string;
  formatDate: (date: string | Date) => string;
  formatCurrency: (amount: number) => string;
}