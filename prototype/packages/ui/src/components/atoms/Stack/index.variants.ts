import { tv, type VariantProps } from "tailwind-variants";

export const stackVariants = tv({
  base: "flex flex-col",
  variants: {
    gap: {
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-8",
    },
  },
  defaultVariants: {
    gap: "md",
  },
});

export type StackVariants = VariantProps<typeof stackVariants>;
