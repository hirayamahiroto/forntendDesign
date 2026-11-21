import type { ElementType, ReactNode } from "react";
import { textVariants, type TextVariants } from "./index.variants";

type TextProps = TextVariants & {
  as?: ElementType;
  className?: string;
  role?: string;
  children: ReactNode;
};

export const Text = ({ as: Component = "p", size, tone, className, role, children }: TextProps) => (
  <Component role={role} className={textVariants({ size, tone, className })}>
    {children}
  </Component>
);
