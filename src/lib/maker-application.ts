// Shared between the Server Action and the client form. Kept out of the
// "use server" module, which may only export async functions.
export type MakerApplicationState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialMakerApplicationState: MakerApplicationState = {
  status: "idle",
  message: "",
};
