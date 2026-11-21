export type Session = {
  readonly userId: string;
};

export const getDemoSession = (): Session => ({ userId: "u_1" });
