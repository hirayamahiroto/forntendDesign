import { Text } from "@repo/ui/atoms/Text";
import { PageLayout } from "@repo/ui/templates/PageLayout";
import { getProfileScreen } from "../../fetchers/profile/getProfileScreen";
import { ProfileEditorClientAdapter } from "./ProfileEditorClientAdapter";

export default async function ProfilePage() {
  const result = await getProfileScreen();

  if (!result.ok) {
    return (
      <PageLayout title="プロフィール">
        <Text tone="danger">{result.error.message}</Text>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="プロフィール">
      <ProfileEditorClientAdapter name={result.value.name} email={result.value.email} />
    </PageLayout>
  );
}
