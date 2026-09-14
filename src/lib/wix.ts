import "server-only";

import { items } from "@wix/data";
import { submissions } from "@wix/forms";
import { createClient, OAuthStrategy } from "@wix/sdk";

import { env } from "@/lib/env";

function createWixClient(clientId: string) {
  return createClient({
    modules: { items, submissions },
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
