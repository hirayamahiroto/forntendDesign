import { tv, type VariantProps } from "tailwind-variants";

export const inputVariants = tv({
  base: "w-full rounded-md border px-3 py-2 text-sm",
  variants: {
    invalid: {
      true: "border-danger",
      false: "border-border",
    },
  },
  defaultVariants: {
    invalid: false,
  },
});

export type InputVariants = VariantProps<typeof inputVariants>;
