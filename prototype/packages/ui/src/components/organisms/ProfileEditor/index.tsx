import type { FormEvent } from "react";
import { Button } from "../../atoms/Button";
import { Stack } from "../../atoms/Stack";
import { Text } from "../../atoms/Text";
import { FormField } from "../../molecules/FormField";

export type ProfileEditorValues = {
  name: string;
};

type ProfileEditorProps = {
  name: string;
  email: string;
  isSaving: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  onSubmit: (values: ProfileEditorValues) => Promise<void> | void;
};

const readValues = (form: HTMLFormElement): ProfileEditorValues | null => {
  const name = new FormData(form).get("name");
  return typeof name === "string" ? { name } : null;
};

export const ProfileEditor = ({ name, email, isSaving, errorMessage, successMessage, onSubmit }: ProfileEditorProps) => {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = readValues(event.currentTarget);
    if (values === null) return;
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <Text size="sm" tone="muted">
          {email}
        </Text>
        <FormField id="profile-name" name="name" label="表示名" defaultValue={name} errorMessage={errorMessage} />
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "保存中…" : "保存する"}
        </Button>
        <Text size="sm" tone="success" role="status">
          {successMessage}
        </Text>
      </Stack>
    </form>
  );
};
