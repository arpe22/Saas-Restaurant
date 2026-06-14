import { InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";
import { FormField, inputClassName } from "@/components/forms/form-field";
import { cn } from "@/lib/utils";

type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: FieldError;
  label: string;
};

export function FormInput({
  className,
  error,
  label,
  ...props
}: FormInputProps) {
  return (
    <FormField error={error?.message} label={label}>
      <input className={cn(inputClassName, className)} {...props} />
    </FormField>
  );
}
