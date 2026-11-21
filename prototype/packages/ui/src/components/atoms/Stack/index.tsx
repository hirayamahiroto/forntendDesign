import type { ReactNode } from "react";
import { stackVariants, type StackVariants } from "./index.variants";

type StackProps = StackVariants & {
  className?: string;
  children: ReactNode;
};

export const Stack = ({ gap, className, children }: StackProps) => (
  <div className={stackVariants({ gap, className })}>{children}</div>
);
