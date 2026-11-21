import type { ComponentProps } from "react";
import { Input } from "../../atoms/Input";
import { Stack } from "../../atoms/Stack";
import { Text } from "../../atoms/Text";

type FormFieldProps = Omit<ComponentProps<typeof Input>, "id" | "invalid"> & {
  id: string;
  label: string;
  errorMessage: string | null;
};

export const FormField = ({ id, label, errorMessage, ...inputProps }: FormFieldProps) => (
  <Stack gap="sm">
    <label htmlFor={id}>
      <Text as="span" size="sm">
        {label}
      </Text>
    </label>
    <Input id={id} invalid={errorMessage !== null} {...inputProps} />
    {errorMessage !== null && (
      <Text size="sm" tone="danger">
        {errorMessage}
      </Text>
    )}
  </Stack>
);
