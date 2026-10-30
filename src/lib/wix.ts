import "server-only";

import { items } from "@wix/data";
import { rsvpV2, wixEventsV2 } from "@wix/events";
import { submissions } from "@wix/forms";
import { createClient, OAuthStrategy } from "@wix/sdk";

import { env } from "@/lib/env";

function createWixClient(clientId: string) {
  return createClient({
    modules: { items, rsvpV2, submissions, wixEventsV2 },
    auth: OAuthStrategy({ clientId }),
  });
}

type WixClient = ReturnType<typeof createWixClient>;

let wixClient: WixClient | undefined;

export function getWixClient(): WixClient {
  // Nothing is memoized if the client ID is missing, so a later call retries.
  wixClient ??= createWixClient(env.wixClientId());

  return wixClient;
}

/**
 * The parts of a Wix SDK error that are safe to log. The error object itself
 * carries the original request, so logging it whole would put visitors'
 * form values in the server logs.
 */
export function describeWixError(error: unknown) {
  if (typeof error !== "object" || error === null) return { error };

  const { status, requestId, details } = error as {
    status?: number;
    requestId?: string;
    details?: { applicationError?: { code?: string } };
  };

  return { status, requestId, code: details?.applicationError?.code };
}
