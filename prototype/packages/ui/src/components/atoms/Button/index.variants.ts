import { tv, type VariantProps } from "tailwind-variants";

export const buttonVariants = tv({
  base: "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50",
  variants: {
    variant: {
      primary: "bg-primary text-primary-foreground",
      outline: "border border-border bg-transparent",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;
