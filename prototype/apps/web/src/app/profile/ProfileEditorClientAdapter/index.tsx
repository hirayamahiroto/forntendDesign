"use client";

import { ProfileEditor } from "@repo/ui/organisms/ProfileEditor";
import { useUpdateMyName } from "./hooks/useUpdateMyName";

type ProfileEditorClientAdapterProps = {
  name: string;
  email: string;
};

export const ProfileEditorClientAdapter = ({ name, email }: ProfileEditorClientAdapterProps) => {
  const { save, isSaving, errorMessage, successMessage } = useUpdateMyName();
  return (
    <ProfileEditor
      name={name}
      email={email}
      isSaving={isSaving}
      errorMessage={errorMessage}
      successMessage={successMessage}
      onSubmit={save}
    />
  );
};
