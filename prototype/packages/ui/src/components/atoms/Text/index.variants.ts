import { tv, type VariantProps } from "tailwind-variants";

export const textVariants = tv({
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      xl: "text-xl font-bold",
    },
    tone: {
      default: "",
      muted: "opacity-70",
      danger: "text-danger",
      success: "text-success",
    },
  },
  defaultVariants: {
    size: "md",
    tone: "default",
  },
});

export type TextVariants = VariantProps<typeof textVariants>;
