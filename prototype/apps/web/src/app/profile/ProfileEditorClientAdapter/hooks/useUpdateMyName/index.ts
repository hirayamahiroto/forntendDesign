import type { ProfileEditorValues } from "@repo/ui/organisms/ProfileEditor";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type UpdateMyNameRequest, updateMyName } from "../../../../../fetchers/users/updateMyName";

const SAVED_MESSAGE = "保存しました";

const toRequest = (values: ProfileEditorValues): UpdateMyNameRequest => ({ name: values.name });

export const useUpdateMyName = () => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const save = async (values: ProfileEditorValues): Promise<void> => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    const result = await updateMyName(toRequest(values));
    setIsSaving(false);

    if (!result.ok) {
      setErrorMessage(result.error.message);
      return;
    }
    setSuccessMessage(SAVED_MESSAGE);
    router.refresh();
  };

  return { save, isSaving, errorMessage, successMessage };
};
