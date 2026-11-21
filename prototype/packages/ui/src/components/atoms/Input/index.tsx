import type { ComponentProps } from "react";
import { inputVariants, type InputVariants } from "./index.variants";

type InputProps = ComponentProps<"input"> & InputVariants;

export const Input = ({ invalid, className, ...props }: InputProps) => (
  <input
    aria-invalid={invalid ?? undefined}
    className={inputVariants({ invalid, className })}
    {...props}
  />
);
