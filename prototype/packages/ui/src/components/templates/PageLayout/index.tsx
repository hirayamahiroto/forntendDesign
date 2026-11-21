import type { ReactNode } from "react";
import { Stack } from "../../atoms/Stack";
import { Text } from "../../atoms/Text";

type PageLayoutProps = {
  title: string;
  children: ReactNode;
};

export const PageLayout = ({ title, children }: PageLayoutProps) => (
  <main className="mx-auto w-full max-w-xl px-4 py-10">
    <Stack gap="lg">
      <Text as="h1" size="xl">
        {title}
      </Text>
      {children}
    </Stack>
  </main>
);
