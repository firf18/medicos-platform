import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

export const Form: React.FC<{ children: React.ReactNode }> = null as any;
export const FormItem: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
> = null as any;
export const FormLabel: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & React.RefAttributes<HTMLLabelElement>
> = null as any;
export const FormControl: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & React.RefAttributes<HTMLLabelElement>
> = null as any;
export const FormDescription: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>
> = null as any;
export const FormMessage: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>
> = null as any;
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: ControllerProps<TFieldValues, TName>): React.ReactElement {
  return null as any;
}