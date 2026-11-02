// Shared between the application Server Actions and their client forms. Kept
// out of the "use server" modules, which may only export async functions.
export type ApplicationState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialApplicationState: ApplicationState = {
  status: "idle",
  message: "",
};
