import { SelectHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";
import { FormField, inputClassName } from "@/components/forms/form-field";

type FormSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: FieldError;
  label: string;
  options: { label: string; value: string }[];
  placeholder?: string;
};

export function FormSelect({
  error,
  label,
  options,
  placeholder,
  ...props
}: FormSelectProps) {
  return (
    <FormField error={error?.message} label={label}>
      <select className={inputClassName} {...props}>
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}
