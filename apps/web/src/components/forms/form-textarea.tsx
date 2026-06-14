import { TextareaHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";
import { FormField, inputClassName } from "@/components/forms/form-field";
import { cn } from "@/lib/utils";

type FormTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: FieldError;
  label: string;
};

export function FormTextarea({
  className,
  error,
  label,
  ...props
}: FormTextareaProps) {
  return (
    <FormField error={error?.message} label={label}>
      <textarea
        className={cn(inputClassName, "min-h-24 py-2", className)}
        {...props}
      />
    </FormField>
  );
}
