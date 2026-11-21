import type { ComponentProps } from "react";
import { buttonVariants, type ButtonVariants } from "./index.variants";

type ButtonProps = ComponentProps<"button"> & ButtonVariants;

export const Button = ({ variant, className, ...props }: ButtonProps) => (
  <button className={buttonVariants({ variant, className })} {...props} />
);
