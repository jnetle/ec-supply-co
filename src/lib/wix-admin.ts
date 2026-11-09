import "server-only";

import { rsvpV2 } from "@wix/events";
import { ApiKeyStrategy, createClient } from "@wix/sdk";

import { env } from "@/lib/env";

function createWixAdminClient() {
  return createClient({
    modules: { rsvpV2 },
    auth: ApiKeyStrategy({
      apiKey: env.wixApiKey(),
      siteId: env.wixSiteId(),
    }),
  });
}

let adminClient: ReturnType<typeof createWixAdminClient> | undefined;

/**
 * Wix as the site owner, for what a visitor isn't allowed to see. The visitor
 * client (`getWixClient`) is refused guest lists (PERMISSION_DENIED).
 */
function getWixAdminClient() {
  adminClient ??= createWixAdminClient();
  return adminClient;
}

/**
 * How this email is already on the event's guest list, if it is. Wix itself
 * happily takes the same email twice.
 */
export async function existingRsvpStatus(
  eventId: string,
  email: string,
): Promise<"YES" | "WAITLIST" | undefined> {
  const wanted = email.trim().toLowerCase();
  let page = await getWixAdminClient()
    .rsvpV2.queryRsvps()
    .eq("eventId", eventId)
    .limit(100)
    .find();

  for (;;) {
    const match = page.items.find(
      (rsvp) =>
        rsvp.email?.trim().toLowerCase() === wanted &&
        (rsvp.status === "YES" || rsvp.status === "WAITLIST"),
    );
    if (match) return match.status as "YES" | "WAITLIST";
    if (!page.hasNext()) break;
    page = await page.next();
  }

  return undefined;
}
