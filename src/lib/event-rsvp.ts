// Shared between the Server Action and the event dialog. Kept out of the
// "use server" module, which may only export async functions.
export type RsvpState = {
  status: "idle" | "reserved" | "waitlisted" | "error";
  message: string;
  /** Seats saved, so the dialog can remember them in this browser. */
  seats?: number;
};

export const initialRsvpState: RsvpState = { status: "idle", message: "" };
